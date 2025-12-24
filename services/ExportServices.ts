// 👇 KRİTİK DEĞİŞİKLİK: '/legacy' EKLENDİ
import * as FileSystem from "expo-file-system/legacy";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import XLSX from "xlsx";

// Tarih formatlamak için yardımcı fonksiyon
const formatDate = (timestamp: number) => {
  return new Date(timestamp).toLocaleDateString("tr-TR");
};

/**
 * 📊 EXCEL DIŞA AKTARMA
 */
export const exportToExcel = async (expenses: any[]) => {
  try {
    // 1. Veriyi Excel formatına uygun hale getir
    const dataToExport = expenses.map((exp) => ({
      ID: exp.id,
      Başlık: exp.title,
      Tutar: exp.amount,
      Tip: exp.type === "income" ? "Gelir" : "Gider",
      Kategori: exp.category,
      Tarih: formatDate(exp.date),
    }));

    // 2. Yeni bir çalışma kitabı (Workbook) oluştur
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(dataToExport);

    // Sütun genişliklerini ayarla
    ws["!cols"] = [
      { wch: 5 }, // ID
      { wch: 20 }, // Başlık
      { wch: 10 }, // Tutar
      { wch: 10 }, // Tip
      { wch: 15 }, // Kategori
      { wch: 15 }, // Tarih
    ];

    XLSX.utils.book_append_sheet(wb, ws, "Harcamalar");

    // 3. Dosyayı base64 formatında oluştur
    const wbout = XLSX.write(wb, { type: "base64", bookType: "xlsx" });

    // 4. Dosyayı geçici klasöre kaydet
    const fileName = `Harcamalar_${new Date().getTime()}.xlsx`;

    // Legacy modülde bu özellikler mevcuttur
    const directory = FileSystem.cacheDirectory || FileSystem.documentDirectory;
    const uri = directory + fileName;

    // Dosyayı yaz
    await FileSystem.writeAsStringAsync(uri, wbout, {
      encoding: "base64", // String olarak base64 (Enum hatasını önler)
    });

    // 5. Paylaşım penceresini aç
    await Sharing.shareAsync(uri, {
      mimeType:
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      dialogTitle: "Excel Dosyasını Paylaş",
      UTI: "com.microsoft.excel.xlsx",
    });
  } catch (error) {
    console.error("Excel Hatası:", error);
    alert("Excel oluşturulurken hata çıktı: " + error);
  }
};

/**
 * 📄 PDF DIŞA AKTARMA
 */
export const exportToPDF = async (
  expenses: any[],
  totalIncome: number,
  totalExpense: number
) => {
  try {
    const htmlContent = `
      <html>
        <head>
          <style>
            body { font-family: 'Helvetica', sans-serif; padding: 20px; }
            h1 { text-align: center; color: #333; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; color: #333; }
            tr:nth-child(even) { background-color: #f9f9f9; }
            .income { color: green; font-weight: bold; }
            .expense { color: red; font-weight: bold; }
            .summary { margin-top: 30px; font-size: 18px; text-align: right; }
          </style>
        </head>
        <body>
          <h1>Harcama Raporu</h1>
          <p>Tarih: ${new Date().toLocaleDateString("tr-TR")}</p>
          
          <table>
            <tr>
              <th>Tarih</th>
              <th>Başlık</th>
              <th>Kategori</th>
              <th>Tip</th>
              <th>Tutar</th>
            </tr>
            ${expenses
              .map(
                (item) => `
              <tr>
                <td>${formatDate(item.date)}</td>
                <td>${item.title}</td>
                <td>${item.category}</td>
                <td class="${item.type}">${
                  item.type === "income" ? "Gelir" : "Gider"
                }</td>
                <td>${item.amount} ₺</td>
              </tr>
            `
              )
              .join("")}
          </table>

          <div class="summary">
            <p>Toplam Gelir: <span class="income">${totalIncome} ₺</span></p>
            <p>Toplam Gider: <span class="expense">${totalExpense} ₺</span></p>
            <p><strong>Net Durum: ${totalIncome - totalExpense} ₺</strong></p>
          </div>
        </body>
      </html>
    `;

    const { uri } = await Print.printToFileAsync({
      html: htmlContent,
      base64: false,
    });

    await Sharing.shareAsync(uri, {
      mimeType: "application/pdf",
      dialogTitle: "Raporu Paylaş",
      UTI: "com.adobe.pdf",
    });
  } catch (error) {
    console.error("PDF Hatası:", error);
    alert("PDF oluşturulurken hata çıktı.");
  }
};
