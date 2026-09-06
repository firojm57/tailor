package org.frj.saas.tailor.service.impl;

import org.frj.saas.tailor.dao.BillDao;
import org.frj.saas.tailor.dao.MeasurementDao;
import org.frj.saas.tailor.dto.CustomerSuggestionDto;
import org.frj.saas.tailor.service.CustomerService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class CustomerServiceImpl implements CustomerService {

    private static final Logger log = LoggerFactory.getLogger(CustomerServiceImpl.class);

    private final MeasurementDao measurementDao;
    private final BillDao billDao;

    public CustomerServiceImpl(MeasurementDao measurementDao, BillDao billDao) {
        this.measurementDao = measurementDao;
        this.billDao = billDao;
    }

    @Override
    public List<CustomerSuggestionDto> searchCustomerSuggestions(String query) {
        if (query == null || query.trim().isEmpty()) {
            return Collections.emptyList();
        }

        String q = query.trim().toLowerCase();
        log.debug("CustomerService: Searching customer suggestions for query '{}'", q);

        Map<String, String> map = new LinkedHashMap<>();

        measurementDao.findAllByOrderByIdDesc().forEach(m -> {
            if ((m.getMobileNumber() != null && m.getMobileNumber().toLowerCase().contains(q)) ||
                (m.getCustomerName() != null && m.getCustomerName().toLowerCase().contains(q))) {
                map.putIfAbsent(m.getMobileNumber(), m.getCustomerName());
            }
        });

        billDao.findAllByOrderByIdDesc().forEach(b -> {
            if ((b.getMobileNumber() != null && b.getMobileNumber().toLowerCase().contains(q)) ||
                (b.getCustomerName() != null && b.getCustomerName().toLowerCase().contains(q))) {
                map.putIfAbsent(b.getMobileNumber(), b.getCustomerName());
            }
        });

        List<CustomerSuggestionDto> result = new ArrayList<>();
        map.forEach((mobile, name) -> result.add(new CustomerSuggestionDto(mobile, name)));
        log.debug("CustomerService: Found {} customer suggestions for query '{}'", result.size(), q);
        return result;
    }
}
