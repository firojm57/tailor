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
            select bi.bill_id, bi.cust_id, c.name, c.mobile
            from customer c inner join billing_items bi on c.id = bi.cust_id
        """;
        return template.query(query, (rs, rowNum) -> new BillingDto(
                rs.getString("bill_id"),
                rs.getLong("cust_id"),
                rs.getString("name"),
                rs.getString("mobile")
        ));
    }
}
