import React from "react";
const fmt = (n) =>
    "₹" + Number(n || 0).toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });

const fmtPlain = (n) =>
    Number(n || 0).toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });

function toWords(n) {
    const a = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten",
        "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
    const b = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
    function words(num) {
        if (num === 0) return "";
        if (num < 20) return a[num] + " ";
        if (num < 100) return b[Math.floor(num / 10)] + " " + a[num % 10] + " ";
        if (num < 1000) return a[Math.floor(num / 100)] + " Hundred " + words(num % 100);
        if (num < 100000) return words(Math.floor(num / 1000)) + "Thousand " + words(num % 1000);
        if (num < 10000000) return words(Math.floor(num / 100000)) + "Lakh " + words(num % 100000);
        return words(Math.floor(num / 10000000)) + "Crore " + words(num % 10000000);
    }
    return "INR " + words(Math.round(n)).trim() + " Only";
}


const TH = ({ children, bg = "#f0f6fc", color = "#1278c8", align = "right", borderLeft = false, w }) => (
    <th style={{
        width: w, padding: "6px 8px", textAlign: align, fontSize: 8.5,
        fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em",
        color, background: bg, borderBottom: "1.5px solid #d0e8f7",
        borderLeft: borderLeft ? "1.5px dashed #d0e8f7" : "none", whiteSpace: "nowrap",
    }}>{children}</th>
);

const TD = ({ children, align = "right", style = {} }) => (
    <td style={{ padding: "7px 8px", textAlign: align, verticalAlign: "top", ...style }}>{children}</td>
);

export default function TaxInvoice({ data = {} }) {
    const seller = data.seller || data.company || {};
    const buyer = data.buyer || data.consignee || data.customer || {};
    const invoiceMeta = {
        invoiceNo: data.invoice?.number || data.invoiceNo || data.invoice?.invoiceNo || data.invoiceNumber || "",
        eWayBill: data.invoice?.eWayBill || data.invoice?.vehicleNumber || data.vehicleNumber || "",
        date: data.invoice?.date || data.invoiceDate || data.date || "",
        paymentMode: data.invoice?.paymentMode || data.paymentMode || "",
        dispatchedThrough: data.invoice?.dispatchedThrough || data.transporterName || "",
        destination: data.invoice?.destination || data.placeOfSupply || "",
    };
    const items = Array.isArray(data.items)
        ? data.items
        : Array.isArray(data.invoiceItems)
            ? data.invoiceItems
            : Array.isArray(data.itemsList)
                ? data.itemsList
                : [];

    const normalizedItems = items.map((item, idx) => {
        const quantity = Number(item.quantity ?? item.qty ?? 0);
        const rate = Number(item.rate ?? item.salePrice ?? item.unitPrice ?? 0);
        const grossAmount = Number(item.grossAmount ?? quantity * rate);
        const discountPct = Number(item.discP ?? item.discountPercent ?? item.discountRate ?? 0);
        const taxableFromItem = Number(item.taxableAmount ?? item.taxableAmt ?? item.taxableValue ?? 0);
        const gstRate = Number(item.gstRate ?? item.gstP ?? item.gst ?? 0);
        
        // Try to get discount from item fields first
        let discountAmt = Number(item.discountAmt ?? item.discA ?? item.discountAmount ?? 0);
        
        // If no explicit discount, calculate from percentage
        if (discountAmt === 0 && discountPct > 0) {
            discountAmt = (grossAmount * discountPct) / 100;
        }
        
        // If still no discount, derive from gross - taxable (if taxable is provided)
        if (discountAmt === 0 && taxableFromItem > 0) {
            discountAmt = Math.max(0, grossAmount - taxableFromItem);
        }
        
        // Calculate taxable amount
        const taxableAmount = Math.max(0, grossAmount - discountAmt);
        
        // Calculate line total
        const lineTotal = Number(item.lineTotal ?? item.total ?? item.amount ?? (taxableAmount * (1 + gstRate / 100)));

        return {
            invoiceItemId: item.invoiceItemId || item.itemId || idx,
            itemName: item.itemName || item.productName || item.description || "",
            batchCode: item.batchCode || item.batch || "",
            hsnCode: item.hsnCode || item.hsn || "",
            quantity,
            rate,
            grossAmount,
            discountAmt,
            discountPct,
            taxableAmount,
            gstRate,
            lineTotal,
        };
    });

    const totalDiscount = normalizedItems.reduce((s, i) => s + Number(i.discountAmt || 0), 0);
    const totalTaxable = normalizedItems.reduce((s, i) => s + Number(i.taxableAmount || 0), 0);
    const totalNet = normalizedItems.reduce((s, i) => s + Number(i.lineTotal || 0), 0);
    const cgst = (totalNet - totalTaxable) / 2;
    const sgst = cgst;
    const totalQty = normalizedItems.reduce((s, i) => s + Number(i.quantity || 0), 0);

    const formattedCompany = {
        name: seller.name || "",
        address: seller.address || "",
        city: seller.city || "",
        gstin: seller.gstin || seller.gstIn || "",
        email: seller.email || "",
        phone: seller.contact || seller.phone || "",
    };

    const formattedBuyer = {
        name: buyer.name || buyer.customerName || "",
        address: buyer.address || buyer.addressLine || "",
        city: buyer.city || "",
        gstin: buyer.gstin || buyer.gstIn || "",
        state: buyer.state || "",
    };

    const handlePrint = () => {
        if (typeof window !== "undefined" && window.print) {
            window.print();
        }
    };

    return (
        <>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=IBM+Plex+Sans:wght@300;400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        body {
          font-family: 'IBM Plex Sans', sans-serif;
          background: #dde4ef;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }

        .screen-wrap {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 24px 16px 40px;
          min-height: 100vh;
        }

        .print-bar {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 18px;
          background: #fff;
          border-radius: 10px;
          padding: 10px 20px;
          box-shadow: 0 2px 12px rgba(0,0,0,.08);
          font-size: 12px;
          color: #475569;
          font-family: 'IBM Plex Sans', sans-serif;
        }

        .print-btn {
          background: #0b1f38;
          color: #fff;
          border: none;
          border-radius: 7px;
          padding: 7px 20px;
          font-size: 12px;
          font-weight: 500;
          cursor: pointer;
          font-family: 'IBM Plex Sans', sans-serif;
          letter-spacing: .04em;
          transition: background .2s;
        }
        .print-btn:hover { background: #1278c8; }

        /* A4 dimensions on screen */
        .a4-card {
          width: 210mm;
          min-height: 297mm;
          background: #fff;
          border-radius: 12px;
          box-shadow: 0 8px 40px rgba(15,38,64,.18);
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }

        .accent-bar { height: 2.5px; background: linear-gradient(90deg,#1278c8,#5ec8ff,#1278c8); flex-shrink: 0; }

        .item-row:nth-child(even) td { background: #f9fbfd; }
        .item-row:nth-child(even) td.disc-cell { background: #fffbf4 !important; }
        .item-row:nth-child(even) td.net-cell  { background: #f2fdf7 !important; }

        @page { size: A4 portrait; margin: 0; }

        @media print {
          html, body { background: #fff !important; }
          .screen-wrap { padding: 0 !important; min-height: unset !important; background: #fff !important; }
          .print-bar { display: none !important; }
          .a4-card {
            width: 210mm !important;
            min-height: 297mm !important;
            border-radius: 0 !important;
            box-shadow: none !important;
            page-break-inside: avoid;
          }
        }

        .f-display { font-family: 'Playfair Display', serif; }
        .f-mono    { font-family: 'IBM Plex Mono', monospace; }
      `}</style>

            <div className="screen-wrap">
                <div className="print-bar">
                    <span>Advanced Tax Invoice — A4 Preview (210 × 297 mm)</span>
                    <button className="print-btn" onClick={handlePrint}>🖨 Print / Save PDF</button>
                </div>

                <div className="a4-card">

                    {/* ── HEADER ── */}
                    <div style={{ background: "#0b1f38", padding: "16px 20px 12px", flexShrink: 0 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                <div style={{
                                    width: 42, height: 42, borderRadius: 9, flexShrink: 0,
                                    background: "linear-gradient(135deg,#1e90c8,#0f5fa6)",
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    fontSize: 20, color: "#fff", fontFamily: "'Playfair Display',serif",
                                }}>A</div>
                                <div>
                                    <p className="f-display" style={{ fontSize: 15, color: "#fff", marginBottom: 2 }}>
                                        {formattedCompany?.name}
                                    </p>
                                    <p style={{ fontSize: 9.5, color: "#8ab0d4", lineHeight: 1.55 }}>
                                        {formattedCompany?.address}, {formattedCompany?.city}<br />
                                        GSTIN:&nbsp;
                                        <span className="f-mono" style={{ color: "#c8dff4" }}>{formattedCompany?.gstin}</span>
                                        &nbsp;|&nbsp;{formattedCompany?.email}&nbsp;|&nbsp;{formattedCompany?.phone}
                                    </p>
                                </div>
                            </div>
                            <div style={{ textAlign: "right" }}>
                                <div style={{
                                    display: "inline-block", background: "#1a4c7a", border: "1px solid #2a6ca0",
                                    borderRadius: 20, padding: "3px 13px", fontSize: 9, color: "#7ec8f0",
                                    letterSpacing: ".08em", textTransform: "uppercase",
                                }}>TEST INVOICE 123</div>
                                <p className="f-display" style={{ fontSize: 9.5, color: "#8ab0d4", marginTop: 5, fontStyle: "italic" }}>
                                    Computer Generated
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="accent-bar" />

                    {/* ── META: 6 cells in one row ── */}
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(6,1fr)", borderBottom: "1px solid #e8edf4", flexShrink: 0 }}>
                        {[
                            { label: "Invoice No.", value: invoiceMeta?.invoiceNo, accent: true, shade: false },
                            { label: "e-Way Bill No.", value: invoiceMeta?.eWayBill, accent: false, shade: false },
                            { label: "Date", value: invoiceMeta?.date, accent: false, shade: false },
                            { label: "Payment Mode", value: invoiceMeta?.paymentMode, accent: false, shade: true },
                            { label: "Dispatched Through", value: invoiceMeta?.dispatchedThrough, accent: false, shade: true },
                            { label: "Destination", value: invoiceMeta?.destination, accent: false, shade: true },
                        ].map((m, i) => (
                            <div key={i} style={{
                                padding: "7px 10px",
                                borderRight: i < 5 ? "1px solid #e8edf4" : "none",
                                background: m.shade ? "#fafbfd" : "#fff",
                            }}>
                                <div style={{ fontSize: 8, textTransform: "uppercase", letterSpacing: ".06em", color: "#94a3b8", marginBottom: 2 }}>
                                    {m.label}
                                </div>
                                <div className="f-mono" style={{ fontSize: 10, fontWeight: 500, color: m.accent ? "#1278c8" : "#1e293b" }}>
                                    {m.value}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* ── PARTIES ── */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", borderBottom: "1px solid #e8edf4", flexShrink: 0 }}>
                        {[
                            { tag: "Seller", tagBg: "#1278c8", data: formattedCompany },
                            { tag: "Bill To", tagBg: "#0f6e56", data: formattedBuyer },
                        ].map((p, i) => (
                            <div key={i} style={{ padding: "10px 14px", borderRight: i === 0 ? "1px solid #e8edf4" : "none" }}>
                                <span style={{
                                    fontSize: 8, textTransform: "uppercase", letterSpacing: ".09em",
                                    color: "#fff", background: p.tagBg, borderRadius: 3,
                                    padding: "2px 7px", display: "inline-block", marginBottom: 5,
                                }}>{p.tag}</span>
                                <p className="f-display" style={{ fontSize: 12, color: "#0f172a", marginBottom: 3 }}>{p?.data?.name || "-"}</p>
                                <p style={{ fontSize: 9.5, color: "#64748b", lineHeight: 1.6, marginBottom: 4 }}>
                                    {p?.data?.address || "-"}<br />{p?.data?.city || "-"}
                                </p>
                                <p style={{ fontSize: 9.5, color: "#64748b", marginBottom: 1 }}>
                                    GSTIN:&nbsp;<span className="f-mono" style={{ color: "#1e293b", fontSize: 10 }}>{p?.data?.gstin || "-"}</span>
                                </p>
                                <p style={{ fontSize: 9.5, color: "#64748b" }}>
                                    State:&nbsp;<span style={{ color: "#1e293b" }}>{p?.data?.state || "-"}</span>
                                </p>
                            </div>
                        ))}
                    </div>

                    {/* ── ITEMS TABLE ── */}
                    <div style={{ overflowX: "auto", flexShrink: 0 }}>
                        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 10.5, tableLayout: "fixed" }}>
                            <thead>
                                <tr>
                                    <TH align="left" w={22}  >#</TH>
                                    <TH align="left" w={160} >Description of Goods</TH>
                                    <TH align="center" w={58}  >HSN/SAC</TH>
                                    <TH align="center" w={62}  >Qty</TH>
                                    <TH w={78}  >Rate (₹)</TH>
                                    <TH bg="#fff8ed" color="#92530a" borderLeft w={100}>Discount Amt (₹)</TH>
                                    <TH w={100} >Taxable Amt (₹)</TH>
                                    <TH bg="#fff3cd" color="#856404" borderLeft w={100}>GST % / Amt (₹)</TH>
                                    <TH bg="#edfaf4" color="#0a5e3f" borderLeft w={100}>Net Amount (₹)</TH>
                                </tr>
                            </thead>
                            <tbody>
                                {Array.isArray(normalizedItems) &&
                                    normalizedItems.map((item, idx) => (

                                        <tr key={item.invoiceItemId} className="item-row">

                                            <TD align="left">{idx + 1}</TD>

                                            <TD align="left">

                                                <div>{item.itemName}</div>

                                            </TD>

                                            <TD align="center">
                                                {item.hsnCode}
                                            </TD>

                                            <TD align="center">
                                                {item.quantity}
                                            </TD>

                                            <TD>
                                                {fmtPlain(item.rate)}
                                            </TD>

                                            <TD>
                                                {fmtPlain(item.discountAmt)}
                                            </TD>

                                            <TD>
                                                {fmtPlain(item.taxableAmount)}
                                            </TD>

                                            <TD style={{ background: "#fff9e6" }}>
                                                <div style={{ fontSize: 9, color: "#666" }}>{item.gstRate}%</div>
                                                <div>{fmtPlain((item.taxableAmount * item.gstRate) / 100)}</div>
                                            </TD>

                                            <TD>
                                                {fmtPlain(item.lineTotal)}
                                            </TD>

                                        </tr>

                                    ))}

                                {/* Subtotal */}
                                <tr style={{ background: "#f4f7fb", borderTop: "1.5px solid #e2e8f0" }}>
                                    <td colSpan={3} style={{ padding: "7px 8px" }} />
                                    <td style={{ padding: "7px 8px", textAlign: "center", fontWeight: 600, color: "#1e293b", fontSize: 10 }}>
                                        {totalQty.toLocaleString("en-IN")} Nos
                                    </td>
                                    <td style={{ padding: "7px 8px", textAlign: "right", color: "#94a3b8" }}>—</td>
                                    <td style={{ padding: "7px 8px", textAlign: "right", color: "#b45309", fontWeight: 500, borderLeft: "1.5px dashed #f0d9b5" }}>
                                        −{fmtPlain(totalDiscount)}
                                    </td>
                                    <td style={{ padding: "7px 8px", textAlign: "right", fontWeight: 500, color: "#1e293b" }}>
                                        {fmtPlain(totalTaxable)}
                                    </td>
                                    <td style={{ padding: "7px 8px", textAlign: "right", fontWeight: 600, color: "#856404", background: "#fff9e6" }}>—</td>
                                    <td style={{ padding: "7px 8px", textAlign: "right", fontWeight: 600, color: "#0a5e3f", borderLeft: "1.5px dashed #b2ead2" }}>
                                        {fmtPlain(totalNet)}
                                    </td>
                                </tr>

                                {/* CGST */}
                                <tr style={{ background: "#fafbfd" }}>
                                    <td colSpan={8} style={{ padding: "5px 8px", textAlign: "right", color: "#64748b", fontSize: 9.5 }}>
                                        Output CGST @ 6%
                                    </td>
                                    <td style={{ padding: "5px 8px", textAlign: "right", color: "#1e293b", fontWeight: 500, fontSize: 9.5 }}>
                                        {fmtPlain(cgst)}
                                    </td>
                                </tr>

                                {/* SGST */}
                                <tr style={{ background: "#fafbfd" }}>
                                    <td colSpan={8} style={{ padding: "5px 8px", textAlign: "right", color: "#64748b", fontSize: 9.5 }}>
                                        Output SGST @ 6%
                                    </td>
                                    <td style={{ padding: "5px 8px", textAlign: "right", color: "#1e293b", fontWeight: 500, fontSize: 9.5 }}>
                                        {fmtPlain(sgst)}
                                    </td>
                                </tr>

                                {/* Grand Total */}
                                <tr style={{ background: "#0b1f38" }}>
                                    <td colSpan={6} style={{ padding: "10px 8px", color: "#8ab0d4", fontSize: 9, fontWeight: 400 }}>
                                        Total Discount: ₹{fmtPlain(totalDiscount)}&nbsp;|&nbsp;
                                        Taxable: ₹{fmtPlain(totalTaxable)}&nbsp;|&nbsp;
                                        GST: ₹{fmtPlain(cgst + sgst)}
                                    </td>
                                    <td style={{ padding: "10px 8px", textAlign: "right", color: "#f0c060", fontWeight: 600, fontSize: 10 }}>
                                        −{fmtPlain(totalDiscount)}
                                    </td>
                                    <td style={{ padding: "10px 8px", textAlign: "right", color: "#c8dff4", fontWeight: 500, fontSize: 10 }}>
                                        Grand Total
                                    </td>
                                    <td style={{ padding: "10px 8px", textAlign: "right", color: "#5ecfff", fontWeight: 700, fontSize: 13 }}>
                                        {fmt(totalNet)}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    {/* ── AMOUNT IN WORDS + TAX BREAKUP ── */}
                    <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", borderTop: "1px solid #e8edf4", flexShrink: 0 }}>
                        <div style={{ padding: "10px 14px", borderRight: "1px solid #e8edf4" }}>
                            <div style={{ fontSize: 8, textTransform: "uppercase", letterSpacing: ".07em", color: "#94a3b8", marginBottom: 3 }}>
                                Amount Chargeable (in words)
                            </div>
                            <div className="f-display" style={{ fontSize: 11, color: "#0f172a", lineHeight: 1.45, marginBottom: 8 }}>
                                {toWords(Math.round(totalNet))}
                            </div>
                            <div style={{ display: "flex", gap: 18 }}>
                                {[
                                    { label: "Total Discount", value: "−" + fmt(totalDiscount), color: "#b45309" },
                                    { label: "Taxable Value", value: fmt(totalTaxable), color: "#1e293b" },
                                    { label: "Total GST", value: fmt(cgst + sgst), color: "#0f6e56" },
                                ].map((s, i) => (
                                    <div key={i}>
                                        <div style={{ fontSize: 8, textTransform: "uppercase", letterSpacing: ".06em", color: "#94a3b8", marginBottom: 2 }}>{s.label}</div>
                                        <div className="f-mono" style={{ fontSize: 10.5, fontWeight: 600, color: s.color }}>{s.value}</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div style={{ padding: "10px 14px" }}>
                            <div style={{ fontSize: 8, textTransform: "uppercase", letterSpacing: ".07em", color: "#94a3b8", marginBottom: 6 }}>
                                Tax Breakup
                            </div>
                            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 9.5 }}>
                                <thead>
                                    <tr>
                                        {["HSN/SAC", "Taxable", "CGST @6%", "SGST @6%", "Total Tax"].map((h, i) => (
                                            <th key={i} style={{
                                                textAlign: i === 0 ? "left" : "right",
                                                fontSize: 8, textTransform: "uppercase", letterSpacing: ".05em",
                                                color: "#94a3b8", fontWeight: 500, paddingBottom: 4,
                                                borderBottom: "1px solid #e8edf4",
                                            }}>{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td style={{ paddingTop: 5, color: "#64748b" }}>8517</td>
                                        <td style={{ paddingTop: 5, textAlign: "right", color: "#1e293b" }}>{fmtPlain(totalTaxable)}</td>
                                        <td style={{ paddingTop: 5, textAlign: "right", color: "#1e293b" }}>{fmtPlain(cgst)}</td>
                                        <td style={{ paddingTop: 5, textAlign: "right", color: "#1e293b" }}>{fmtPlain(sgst)}</td>
                                        <td style={{ paddingTop: 5, textAlign: "right", fontWeight: 600, color: "#0f6e56" }}>{fmtPlain(cgst + sgst)}</td>
                                    </tr>
                                    <tr style={{ borderTop: "1px solid #e8edf4" }}>
                                        <td style={{ paddingTop: 4, fontWeight: 600, color: "#1e293b" }}>Total</td>
                                        <td style={{ paddingTop: 4, textAlign: "right", fontWeight: 600, color: "#1e293b" }}>{fmtPlain(totalTaxable)}</td>
                                        <td style={{ paddingTop: 4, textAlign: "right", fontWeight: 600, color: "#1e293b" }}>{fmtPlain(cgst)}</td>
                                        <td style={{ paddingTop: 4, textAlign: "right", fontWeight: 600, color: "#1e293b" }}>{fmtPlain(sgst)}</td>
                                        <td style={{ paddingTop: 4, textAlign: "right", fontWeight: 700, color: "#0f6e56", fontSize: 10 }}>{fmtPlain(cgst + sgst)}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* ── FOOTER ── */}
                    <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", borderTop: "1px solid #e8edf4", flexShrink: 0 }}>
                        <div style={{ padding: "10px 14px", borderRight: "1px solid #e8edf4" }}>
                            <div style={{ fontSize: 8, textTransform: "uppercase", letterSpacing: ".07em", color: "#000000", marginBottom: 4 }}>
                                Declaration
                            </div>
                            <p style={{ fontSize: 9.5, color: "#64748b", lineHeight: 1.6 }}>
                                We declare that this invoice shows the actual price of the goods described and that all particulars
                                are true and correct. Goods once sold will not be taken back or exchanged. Subject to Lucknow jurisdiction.
                            </p>
                        </div>
                        <div style={{ padding: "10px 14px", display: "flex", flexDirection: "column", alignItems: "flex-end", justifyContent: "space-between" }}>
                            <div className="f-display" style={{ fontSize: 10, color: "#0f172a", textAlign: "right" }}>
                                For  {formattedCompany?.name}
                            </div>
                            <div style={{
                                width: 90, height: 36, border: "1px solid #e2e8f0",
                                borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center",
                                margin: "6px 0",
                            }}>
                                <svg width="76" height="26" viewBox="0 0 76 26" fill="none" style={{ opacity: 0.28 }}>
                                    <path d="M4 20Q16 4 26 12Q38 22 50 8Q60 0 72 10"
                                        stroke="#1278c8" strokeWidth="1.6" fill="none" strokeLinecap="round" />
                                </svg>
                            </div>
                            <div style={{ fontSize: 9, color: "#040505", textAlign: "right" }}>Authorised Signatory</div>
                        </div>
                    </div>

                    {/* ── STAMP BAR ── */}
                    <div style={{
                        padding: "7px 16px", background: "#eef4fc",
                        borderTop: "1px solid #e8edf4",
                        display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0,
                    }}>
                        <span style={{ fontSize: 9, color: "#000000" }}>
                            This is a Computer Generated Invoice &nbsp;•&nbsp; E. &amp; O.E.
                        </span>
                        <span style={{
                            background: "#e1f5ee", color: "#085041", borderRadius: 20,
                            padding: "2px 11px", fontSize: 9, fontWeight: 500,
                            display: "flex", alignItems: "center", gap: 5,
                        }}>
                          
                        </span>
                    </div>

                </div>{/* /a4-card */}
            </div>{/* /screen-wrap */}
        </>
    );
}
