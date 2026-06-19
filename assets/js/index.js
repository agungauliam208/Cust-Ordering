document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("[data-table-form]");
  const input = document.querySelector("[data-table-input]");
  const savedTable = getTableNumber();
  const params = new URLSearchParams(window.location.search);
  const qrTable = params.get("table");

  if (qrTable) input.value = qrTable;
  else if (savedTable) input.value = savedTable;

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const table = setTableNumber(input.value);

    if (!table) {
      showToast("Nomor meja wajib diisi agar pesanan bisa dikirim ke meja kamu.");
      input.focus();
      return;
    }

    window.location.href = "menu.html";
  });
});
