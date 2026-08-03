package com.health360.search.application.service;

import com.health360.doctor.infrastructure.persistence.entity.ConsultationDefaultEntity;
import com.health360.doctor.infrastructure.persistence.entity.DoctorProfileEntity;
import com.health360.doctor.infrastructure.persistence.entity.HospitalAssociationEntity;
import com.health360.doctor.infrastructure.persistence.repository.ConsultationDefaultRepository;
import com.health360.doctor.infrastructure.persistence.repository.DoctorLanguageRepository;
import com.health360.doctor.infrastructure.persistence.repository.DoctorProfileRepository;
import com.health360.doctor.infrastructure.persistence.repository.HospitalAssociationRepository;
import com.health360.hospital.infrastructure.persistence.entity.BranchEntity;
import com.health360.hospital.infrastructure.persistence.entity.HospitalEntity;
import com.health360.hospital.infrastructure.persistence.repository.BranchRepository;
import com.health360.hospital.infrastructure.persistence.repository.DepartmentRepository;
import com.health360.hospital.infrastructure.persistence.repository.HospitalRepository;
import com.health360.iam.infrastructure.persistence.entity.UserEntity;
import com.health360.iam.infrastructure.persistence.repository.UserRepository;
import com.health360.location.domain.GeoUtils;
import com.health360.scheduling.infrastructure.persistence.repository.TimeSlotRepository;
import com.health360.search.presentation.dto.request.DoctorSearchRequest;
import com.health360.search.presentation.dto.response.DoctorSearchResultResponse;
import com.health360.search.presentation.dto.response.PagedDoctorSearchResponse;
import com.health360.shared.infrastructure.persistence.entity.SpecializationEntity;
import com.health360.shared.infrastructure.persistence.repository.SpecializationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DoctorSearchService {

    private static final String VERIFIED = "VERIFIED";

    private final DoctorProfileRepository doctorProfileRepository;
    private final UserRepository userRepository;
    private final SpecializationRepository specializationRepository;
    private final HospitalAssociationRepository hospitalAssociationRepository;
    private final HospitalRepository hospitalRepository;
    private final BranchRepository branchRepository;
    private final DepartmentRepository departmentRepository;
    private final DoctorLanguageRepository doctorLanguageRepository;
    private final ConsultationDefaultRepository consultationDefaultRepository;
    private final TimeSlotRepository timeSlotRepository;

    @Transactional(readOnly = true)
    public PagedDoctorSearchResponse search(UUID tenantId, DoctorSearchRequest request) {
        int page = Math.max(request.getPage(), 0);
        int size = Math.min(Math.max(request.getSize(), 1), 50);

        List<DoctorProfileEntity> verified = doctorProfileRepository
                .findByTenantIdAndVerificationStatusAndDeletedAtIsNull(tenantId, VERIFIED);

        if (verified.isEmpty()) {
            return emptyPage(page, size);
        }

        Map<UUID, UserEntity> users = loadUsers(verified);
        Map<UUID, SpecializationEntity> specializations = loadSpecializations(verified);
        Map<UUID, List<HospitalAssociationEntity>> associations = loadAssociations(verified);
        Map<UUID, HospitalEntity> hospitals = loadHospitals(associations);
        Map<UUID, BranchEntity> branches = loadBranches(associations);
        Map<UUID, List<String>> languages = loadLanguages(verified);
        Map<UUID, List<String>> consultationModes = loadConsultationModes(verified);
        Map<UUID, List<ConsultationDefaultEntity>> fees = loadFees(verified);
        LocalDate today = LocalDate.now();

        List<DoctorSearchResultResponse> matches = new ArrayList<>();

        for (DoctorProfileEntity doctor : verified) {
            UserEntity user = users.get(doctor.getUserId());
            if (user == null) {
                continue;
            }

            String doctorName = (user.getFirstName() + " " + user.getLastName()).trim();
            String specializationName = resolveSpecializationName(doctor, specializations);

            List<HospitalAssociationEntity> doctorAssociations = associations.getOrDefault(doctor.getId(), List.of())
                    .stream()
                    .filter(a -> "ACTIVE".equals(a.getStatus()))
                    .toList();

            if (doctorAssociations.isEmpty()) {
                continue;
            }

            AssociationMatch best = pickBestAssociation(
                    doctorAssociations, hospitals, branches, request.getLatitude(), request.getLongitude());

            if (best == null) {
                continue;
            }

            boolean availableToday = timeSlotRepository
                    .findByDoctorIdAndHospitalIdAndBranchIdAndSlotDateBetweenAndDeletedAtIsNullOrderBySlotDateAscStartTimeAsc(
                            doctor.getId(),
                            best.association().getHospitalId(),
                            best.association().getBranchId(),
                            today,
                            today)
                    .stream()
                    .anyMatch(s -> "AVAILABLE".equals(s.getStatus()));

            FeeInfo feeInfo = resolveMinFee(fees.getOrDefault(doctor.getId(), List.of()));

            if (!matchesFilters(request, doctorName, specializationName, doctor, best.hospital(), best.branch(),
                    languages.getOrDefault(doctor.getId(), List.of()),
                    consultationModes.getOrDefault(doctor.getId(), List.of()),
                    availableToday, feeInfo, best.distanceKm())) {
                continue;
            }

            matches.add(DoctorSearchResultResponse.builder()
                    .doctorId(doctor.getId())
                    .name(doctorName)
                    .specialization(specializationName)
                    .hospitalName(best.hospital() != null ? best.hospital().getName() : null)
                    .branchName(best.branch() != null ? best.branch().getName() : null)
                    .city(best.branch() != null ? best.branch().getCity() : null)
                    .gender(doctor.getGender())
                    .yearsExperience(doctor.getTotalYearsExperience())
                    .languages(languages.getOrDefault(doctor.getId(), List.of()))
                    .consultationModes(consultationModes.getOrDefault(doctor.getId(), List.of()))
                    .availableToday(availableToday)
                    .averageRating(doctor.getAverageRating())
                    .reviewCount(doctor.getReviewCount())
                    .distanceKm(best.distanceKm())
                    .minConsultationFee(feeInfo.fee())
                    .feeCurrency(feeInfo.currency())
                    .build());
        }

        sortMatches(matches, request.getSort());

        int from = Math.min(page * size, matches.size());
        int to = Math.min(from + size, matches.size());
        int totalPages = size == 0 ? 0 : (int) Math.ceil((double) matches.size() / size);

        return PagedDoctorSearchResponse.builder()
                .content(matches.subList(from, to))
                .page(page)
                .size(size)
                .totalElements(matches.size())
                .totalPages(totalPages)
                .build();
    }

    private record AssociationMatch(
            HospitalAssociationEntity association,
            HospitalEntity hospital,
            BranchEntity branch,
            BigDecimal distanceKm) {
    }

    private record FeeInfo(BigDecimal fee, String currency) {
    }

    private AssociationMatch pickBestAssociation(
            List<HospitalAssociationEntity> associations,
            Map<UUID, HospitalEntity> hospitals,
            Map<UUID, BranchEntity> branches,
            Double latitude,
            Double longitude) {
        AssociationMatch best = null;
        for (HospitalAssociationEntity association : associations) {
            HospitalEntity hospital = hospitals.get(association.getHospitalId());
            BranchEntity branch = association.getBranchId() != null
                    ? branches.get(association.getBranchId()) : null;
            BigDecimal distance = computeDistance(latitude, longitude, branch);
            if (best == null) {
                best = new AssociationMatch(association, hospital, branch, distance);
                continue;
            }
            if (distance != null && (best.distanceKm() == null
                    || distance.compareTo(best.distanceKm()) < 0)) {
                best = new AssociationMatch(association, hospital, branch, distance);
            }
        }
        return best;
    }

    private BigDecimal computeDistance(Double latitude, Double longitude, BranchEntity branch) {
        if (latitude == null || longitude == null || branch == null
                || !GeoUtils.hasCoordinates(branch.getLatitude(), branch.getLongitude())) {
            return null;
        }
        return GeoUtils.distanceKmRounded(
                latitude, longitude,
                branch.getLatitude().doubleValue(), branch.getLongitude().doubleValue());
    }

    private FeeInfo resolveMinFee(List<ConsultationDefaultEntity> defaults) {
        Optional<ConsultationDefaultEntity> min = defaults.stream()
                .filter(d -> d.getFeeAmount() != null)
                .min(Comparator.comparing(ConsultationDefaultEntity::getFeeAmount));
        return min.map(d -> new FeeInfo(d.getFeeAmount(), d.getCurrency()))
                .orElse(new FeeInfo(null, "INR"));
    }

    private void sortMatches(List<DoctorSearchResultResponse> matches, String sort) {
        String sortKey = sort != null ? sort.trim().toUpperCase() : "RELEVANCE";
        Comparator<DoctorSearchResultResponse> comparator = switch (sortKey) {
            case "NEAREST" -> Comparator.comparing(
                    DoctorSearchResultResponse::getDistanceKm,
                    Comparator.nullsLast(Comparator.naturalOrder()));
            case "HIGHEST_RATED" -> Comparator.comparing(
                    DoctorSearchResultResponse::getAverageRating,
                    Comparator.nullsLast(Comparator.reverseOrder()));
            case "MOST_EXPERIENCED" -> Comparator.comparing(
                    DoctorSearchResultResponse::getYearsExperience,
                    Comparator.nullsLast(Comparator.reverseOrder()));
            case "LOWEST_FEE" -> Comparator.comparing(
                    DoctorSearchResultResponse::getMinConsultationFee,
                    Comparator.nullsLast(Comparator.naturalOrder()));
            default -> Comparator.comparing(DoctorSearchResultResponse::getName, String.CASE_INSENSITIVE_ORDER);
        };
        matches.sort(comparator);
    }

    private boolean matchesFilters(
            DoctorSearchRequest request,
            String doctorName,
            String specializationName,
            DoctorProfileEntity doctor,
            HospitalEntity hospital,
            BranchEntity branch,
            List<String> languages,
            List<String> consultationModes,
            boolean availableToday,
            FeeInfo feeInfo,
            BigDecimal distanceKm) {
        if (request.getQ() != null && !request.getQ().isBlank()) {
            String q = request.getQ().trim().toLowerCase();
            boolean nameMatch = doctorName.toLowerCase().contains(q);
            boolean specMatch = specializationName != null && specializationName.toLowerCase().contains(q);
            boolean hospitalMatch = hospital != null && hospital.getName().toLowerCase().contains(q);
            if (!nameMatch && !specMatch && !hospitalMatch) {
                return false;
            }
        }

        if (request.getSpecialization() != null && !request.getSpecialization().isBlank()) {
            if (specializationName == null
                    || !specializationName.toLowerCase().contains(request.getSpecialization().trim().toLowerCase())) {
                return false;
            }
        }

        if (request.getHospital() != null && !request.getHospital().isBlank()) {
            if (hospital == null
                    || !hospital.getName().toLowerCase().contains(request.getHospital().trim().toLowerCase())) {
                return false;
            }
        }

        if (request.getCity() != null && !request.getCity().isBlank()) {
            if (branch == null
                    || !branch.getCity().toLowerCase().contains(request.getCity().trim().toLowerCase())) {
                return false;
            }
        }

        if (request.getDepartment() != null && !request.getDepartment().isBlank() && hospital != null) {
            boolean deptMatch = departmentRepository
                    .findByHospitalIdAndDeletedAtIsNullOrderByNameAsc(hospital.getId())
                    .stream()
                    .anyMatch(d -> d.getName().toLowerCase().contains(request.getDepartment().trim().toLowerCase()));
            if (!deptMatch) {
                return false;
            }
        }

        if (request.getMinExperience() != null) {
            if (doctor.getTotalYearsExperience() == null
                    || doctor.getTotalYearsExperience() < request.getMinExperience()) {
                return false;
            }
        }

        if (request.getLanguage() != null && !request.getLanguage().isBlank()) {
            String lang = request.getLanguage().trim().toLowerCase();
            if (languages.stream().noneMatch(l -> l.toLowerCase().contains(lang))) {
                return false;
            }
        }

        if (request.getGender() != null && !request.getGender().isBlank()) {
            if (doctor.getGender() == null
                    || !doctor.getGender().equalsIgnoreCase(request.getGender().trim())) {
                return false;
            }
        }

        if (Boolean.TRUE.equals(request.getAvailableToday()) && !availableToday) {
            return false;
        }

        if (request.getConsultationMode() != null && !request.getConsultationMode().isBlank()) {
            String mode = request.getConsultationMode().trim().toUpperCase();
            if (consultationModes.stream().noneMatch(m -> m.equalsIgnoreCase(mode))) {
                return false;
            }
        }

        if (request.getMinRating() != null) {
            if (doctor.getAverageRating() == null
                    || doctor.getAverageRating().compareTo(request.getMinRating()) < 0) {
                return false;
            }
        }

        if (request.getMaxFee() != null && feeInfo.fee() != null
                && feeInfo.fee().compareTo(request.getMaxFee()) > 0) {
            return false;
        }

        if (request.getMaxDistance() != null && request.getLatitude() != null && request.getLongitude() != null) {
            if (distanceKm == null || distanceKm.doubleValue() > request.getMaxDistance()) {
                return false;
            }
        }

        return true;
    }

    private String resolveSpecializationName(
            DoctorProfileEntity doctor,
            Map<UUID, SpecializationEntity> specializations) {
        if (doctor.getPrimarySpecializationId() == null) {
            return null;
        }
        SpecializationEntity spec = specializations.get(doctor.getPrimarySpecializationId());
        return spec != null ? spec.getName() : null;
    }

    private Map<UUID, UserEntity> loadUsers(List<DoctorProfileEntity> doctors) {
        Set<UUID> userIds = doctors.stream().map(DoctorProfileEntity::getUserId).collect(Collectors.toSet());
        return userRepository.findAllById(userIds).stream()
                .collect(Collectors.toMap(UserEntity::getId, Function.identity()));
    }

    private Map<UUID, SpecializationEntity> loadSpecializations(List<DoctorProfileEntity> doctors) {
        Set<UUID> ids = doctors.stream()
                .map(DoctorProfileEntity::getPrimarySpecializationId)
                .filter(id -> id != null)
                .collect(Collectors.toSet());
        if (ids.isEmpty()) {
            return Map.of();
        }
        return specializationRepository.findAllById(ids).stream()
                .collect(Collectors.toMap(SpecializationEntity::getId, Function.identity()));
    }

    private Map<UUID, List<HospitalAssociationEntity>> loadAssociations(List<DoctorProfileEntity> doctors) {
        Set<UUID> doctorIds = doctors.stream().map(DoctorProfileEntity::getId).collect(Collectors.toSet());
        return doctorIds.stream()
                .collect(Collectors.toMap(
                        Function.identity(),
                        id -> hospitalAssociationRepository.findByDoctorIdAndDeletedAtIsNullOrderByCreatedAtDesc(id)));
    }

    private Map<UUID, HospitalEntity> loadHospitals(Map<UUID, List<HospitalAssociationEntity>> associations) {
        Set<UUID> hospitalIds = associations.values().stream()
                .flatMap(List::stream)
                .map(HospitalAssociationEntity::getHospitalId)
                .collect(Collectors.toSet());
        return hospitalRepository.findAllById(hospitalIds).stream()
                .collect(Collectors.toMap(HospitalEntity::getId, Function.identity()));
    }

    private Map<UUID, BranchEntity> loadBranches(Map<UUID, List<HospitalAssociationEntity>> associations) {
        Set<UUID> branchIds = associations.values().stream()
                .flatMap(List::stream)
                .map(HospitalAssociationEntity::getBranchId)
                .filter(id -> id != null)
                .collect(Collectors.toSet());
        return branchRepository.findAllById(branchIds).stream()
                .collect(Collectors.toMap(BranchEntity::getId, Function.identity()));
    }

    private Map<UUID, List<String>> loadLanguages(List<DoctorProfileEntity> doctors) {
        return doctors.stream()
                .collect(Collectors.toMap(
                        DoctorProfileEntity::getId,
                        d -> doctorLanguageRepository.findByDoctorIdOrderByLanguageCodeAsc(d.getId()).stream()
                                .map(l -> l.getLanguageCode())
                                .toList()));
    }

    private Map<UUID, List<String>> loadConsultationModes(List<DoctorProfileEntity> doctors) {
        return doctors.stream()
                .collect(Collectors.toMap(
                        DoctorProfileEntity::getId,
                        d -> consultationDefaultRepository.findByDoctorIdAndDeletedAtIsNull(d.getId())
                                .stream()
                                .map(ConsultationDefaultEntity::getConsultationType)
                                .distinct()
                                .toList()));
    }

    private Map<UUID, List<ConsultationDefaultEntity>> loadFees(List<DoctorProfileEntity> doctors) {
        return doctors.stream()
                .collect(Collectors.toMap(
                        DoctorProfileEntity::getId,
                        d -> consultationDefaultRepository.findByDoctorIdAndDeletedAtIsNull(d.getId())));
    }

    private PagedDoctorSearchResponse emptyPage(int page, int size) {
        return PagedDoctorSearchResponse.builder()
                .content(List.of())
                .page(page)
                .size(size)
                .totalElements(0)
                .totalPages(0)
                .build();
    }
}
