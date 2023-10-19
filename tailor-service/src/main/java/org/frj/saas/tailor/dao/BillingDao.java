package org.frj.saas.tailor.dao;

import org.frj.saas.tailor.dto.BillingDto;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public class BillingDao {

    @Autowired
    private NamedParameterJdbcTemplate template;

    public List<BillingDto> getAllBills() {
        String query = """
            select b.bill_id, b.bill_date, b.due_date, b.paid_amount, b.pending_amount,
            bi.cust_id, bi.quantity, bi.rate
            from billing b inner join billing_items bi on b.bill_id = bi.bill_id
        """;
        return template.query(query, (rs, rowNum) -> new BillingDto(
                rs.getString("bill_id"),
                rs.getDate("bill_date"),
                rs.getDate("due_date"),
                rs.getDouble("paid_amount"),
                rs.getDouble("pending_amount"),
                rs.getLong("cust_id"),
                rs.getInt("quantity"),
                rs.getDouble("rate")
        ));
    }
}
