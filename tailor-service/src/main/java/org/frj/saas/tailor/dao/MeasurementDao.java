package org.frj.saas.tailor.dao;

import org.frj.saas.tailor.dto.MeasurementDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MeasurementDao extends JpaRepository<MeasurementDto, Long> {
    List<MeasurementDto> findAllByOrderByIdDesc();

    @Query("SELECT m FROM MeasurementDto m WHERE " +
           "(:search = '' OR LOWER(m.customerName) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(m.mobileNumber) LIKE LOWER(CONCAT('%', :search, '%'))) AND " +
           "(:clothingTypeId = 0L OR m.clothingTypeId = :clothingTypeId) " +
           "ORDER BY m.id DESC")
    Page<MeasurementDto> findFiltered(
            @Param("search") String search, 
            @Param("clothingTypeId") Long clothingTypeId, 
            Pageable pageable
    );
}
