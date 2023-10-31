package org.frj.saas.tailor.service;

import org.frj.saas.tailor.dao.BillingDao;
import org.frj.saas.tailor.dto.BillingDto;
import org.frj.saas.tailor.model.BillingModel;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class BillingService {

    @Autowired
    private BillingDao billingDao;

    public List<BillingModel> getAllBills() {
        List<BillingDto> allBills = billingDao.getAllBills();
        return allBills.stream().map(dto -> new BillingModel(
                dto.getBillId(), dto.getCustId(), dto.getCustName(), dto.getCustMobile()
        )).collect(Collectors.toList());
    }

}
