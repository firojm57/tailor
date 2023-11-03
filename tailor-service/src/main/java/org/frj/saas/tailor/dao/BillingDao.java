package org.frj.saas.tailor.dao;

import org.frj.saas.tailor.dto.bill.BillingItemDto;
import org.frj.saas.tailor.dto.bill.BillDetailDto;
import org.frj.saas.tailor.dto.bill.BillingDto;
import org.frj.saas.tailor.dto.customer.CustomerDto;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Repository
public class BillingDao {

    @Autowired
    private NamedParameterJdbcTemplate template;

    public List<BillingDto> getAllBills() {
        String query = """
            select b.bill_id, c.cust_id, c.name, c.mobile
            from customer c inner join billing b on c.cust_id = b.cust_id
        """;
        return template.query(query, (rs, rowNum) -> new BillingDto(
                rs.getString("bill_id"),
                rs.getLong("cust_id"),
                rs.getString("name"),
                rs.getString("mobile")
        ));
    }

    public BillDetailDto getBillDetailById(String billId) {
        String query = """
            select b.bill_id, b.bill_date, b.due_date, b.paid_amount, b.pending_amount,
            bi.quantity, bi.rate, bi.type, bi.measure_data, c.cust_id, c.name, c.address, c.mobile
            from billing b inner join billing_items bi on b.bill_id = bi.bill_id
            inner join customer c on c.cust_id = b.cust_id
            where bi.bill_id = :billId
        """;
        MapSqlParameterSource params = new MapSqlParameterSource().addValue("billId", billId);
        Map<String, BillDetailDto> dtoMap = new HashMap<>();
        return template.query(query, params, (rs, rowNum) -> {
            String resBillId = rs.getString("bill_id");
            BillDetailDto billDetailDto = dtoMap.get(resBillId);
            if (billDetailDto == null) {
                CustomerDto customerDto = new CustomerDto(rs.getLong("cust_id"), rs.getString("name"),
                        rs.getString("address"), rs.getString("mobile"));
                billDetailDto = new BillDetailDto(
                        resBillId, rs.getDate("bill_date"),
                        rs.getDate("due_date"),
                        rs.getDouble("paid_amount"),
                        rs.getDouble("pending_amount"), customerDto,
                        new ArrayList<>());
                dtoMap.put(resBillId, billDetailDto);
            }
            BillingItemDto itemDto = new BillingItemDto(rs.getString("type"),
                    rs.getInt("quantity"), rs.getDouble("rate"),
                    rs.getString("measure_data"));
            billDetailDto.getBillingItems().add(itemDto);
            return billDetailDto;
        }).stream().findFirst().orElse(null);
    }
}
