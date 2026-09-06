package org.frj.saas.tailor.dao;

import org.frj.saas.tailor.dto.bill.DraftInvoice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DraftInvoiceDao extends JpaRepository<DraftInvoice, String> {
}
