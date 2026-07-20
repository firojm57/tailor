package org.frj.saas.tailor.service.impl;

import org.frj.saas.tailor.dao.BillDao;
import org.frj.saas.tailor.dao.MeasurementDao;
import org.frj.saas.tailor.dto.DashboardStatsDto;
import org.frj.saas.tailor.dto.MeasurementDto;
import org.frj.saas.tailor.dto.bill.BillDto;
import org.frj.saas.tailor.service.DashboardService;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
public class DashboardServiceImpl implements DashboardService {

    private final BillDao billDao;
    private final MeasurementDao measurementDao;

    public DashboardServiceImpl(BillDao billDao, MeasurementDao measurementDao) {
        this.billDao = billDao;
        this.measurementDao = measurementDao;
    }

    @Override
    public DashboardStatsDto getStats() {
        List<BillDto> bills = billDao.findAll();
        List<MeasurementDto> measurements = measurementDao.findAll();

        Set<String> uniqueMobiles = new HashSet<>();
        bills.forEach(b -> {
            if (b.getMobileNumber() != null && !b.getMobileNumber().isBlank()) {
                uniqueMobiles.add(b.getMobileNumber());
            }
        });
        measurements.forEach(m -> {
            if (m.getMobileNumber() != null && !m.getMobileNumber().isBlank()) {
                uniqueMobiles.add(m.getMobileNumber());
            }
        });

        double totalEarnings = bills.stream()
                .filter(b -> Boolean.TRUE.equals(b.getPaid()))
                .mapToDouble(b -> b.getGrandTotal() != null ? b.getGrandTotal() : 0.0)
                .sum();

        return new DashboardStatsDto(
                uniqueMobiles.size(),
                totalEarnings,
                measurements.size(),
                bills.size()
        );
    }
}
