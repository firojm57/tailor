package org.frj.saas.tailor.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.frj.saas.tailor.dao.BillingDao;
import org.frj.saas.tailor.dto.bill.BillingItemDto;
import org.frj.saas.tailor.dto.bill.BillDetailDto;
import org.frj.saas.tailor.dto.bill.BillingDto;
import org.frj.saas.tailor.model.bill.BillDetailModel;
import org.frj.saas.tailor.model.bill.BillingItemModel;
import org.frj.saas.tailor.model.bill.BillingModel;
import org.frj.saas.tailor.model.customer.CustomerModel;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class BillingService {

    @Autowired
    private BillingDao billingDao;

    private ObjectMapper mapper = new ObjectMapper();

    public List<BillingModel> getAllBills() {
        List<BillingDto> allBills = billingDao.getAllBills();
        return allBills.stream().map(dto -> new BillingModel(
                dto.getBillId(), dto.getCustId(), dto.getCustName(), dto.getCustMobile()
        )).collect(Collectors.toList());
    }

    public BillDetailModel getBillDetailById(String billId) throws JsonProcessingException {
        BillDetailDto dto = billingDao.getBillDetailById(billId);
        if (dto != null) {
            List<BillingItemModel> billItems = new ArrayList<>();
            for (BillingItemDto itemDto : dto.getBillingItems()) {
                billItems.add(new BillingItemModel(itemDto.getType(), itemDto.getQuantity(), itemDto.getRate(),
                        mapper.readTree(itemDto.getMeasurement())));
            }
            CustomerModel customerModel = Optional.ofNullable(dto.getCustomer())
                    .map(c -> new CustomerModel(c.getCustId(), c.getName(), c.getAddress(), c.getMobile()))
                    .orElse(null);
            return new BillDetailModel(
                    dto.getBillId(), dto.getBillDate(), dto.getDueDate(), dto.getPaidAmount(),
                    dto.getPendingAmount(), customerModel, billItems
            );
        }
        return null;
    }
}
