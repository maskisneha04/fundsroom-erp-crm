const base = "http://localhost:5000/api";

async function login(email, password) {
  const res = await fetch(`${base}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const body = await res.json();
  return { status: res.status, body };
}

async function api(method, path, token, body) {
  const res = await fetch(`${base}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  return { status: res.status, data };
}

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
  console.log("PASS:", msg);
}

async function main() {
  const t1 = await login("admin@test.com", "Admin@123");
  assert(t1.status === 200 && t1.body.data?.token, "TEST1 admin login");
  const token = t1.body.data.token;

  const t2 = await login("admin@test.com", "wrong");
  assert(t2.status === 401, "TEST2 invalid login");

  const t3 = await api("POST", "/customers", token, {
    customerName: "Scenario Customer",
    mobileNumber: "9111222333",
    email: "scen@example.com",
    businessName: "Scenario Biz",
    customerType: "WHOLESALE",
    address: "Pune",
    status: "ACTIVE",
  });
  assert(t3.status === 201, "TEST3 create customer");
  const customerId = t3.data.data.id;

  const t4 = await api("GET", "/customers?search=Scenario", token);
  assert(t4.data.data.length >= 1, "TEST4 search customers");

  const t5 = await api("POST", "/products", token, {
    productName: "Scenario Monitor",
    sku: `SCN-MON-${Date.now()}`,
    category: "Displays",
    unitPrice: 100,
    currentStock: 50,
    minimumStockAlertQuantity: 10,
    warehouseLocation: "A1",
  });
  assert(t5.status === 201 && t5.data.data.currentStock === 50, "TEST5 create product");
  const productId = t5.data.data.id;

  const t6 = await api("POST", `/products/${productId}/stock-in`, token, {
    quantity: 20,
    reason: "Purchase received",
  });
  assert(t6.status === 201 && t6.data.data.product.currentStock === 70, "TEST6 stock in 50→70");

  const t7 = await api("POST", "/challans", token, {
    customerId,
    status: "DRAFT",
    items: [{ productId, quantity: 10 }],
  });
  const afterDraft = await api("GET", `/products/${productId}`, token);
  assert(
    t7.status === 201 &&
      t7.data.data.status === "DRAFT" &&
      afterDraft.data.data.currentStock === 70 &&
      String(t7.data.data.challanNumber).startsWith("SC-"),
    `TEST7 draft no stock change (${t7.data.data.challanNumber})`
  );

  const t8 = await api("POST", `/challans/${t7.data.data.id}/confirm`, token);
  const afterConfirm = await api("GET", `/products/${productId}`, token);
  const moves = await api("GET", `/products/${productId}/stock-movements`, token);
  const outMove = moves.data.data.find(
    (m) => m.movementType === "OUT" && m.reason.includes(t7.data.data.challanNumber)
  );
  assert(
    t8.data.data.status === "CONFIRMED" && afterConfirm.data.data.currentStock === 60 && outMove,
    "TEST8 confirm stock 70→60 + OUT movement"
  );

  const draftFail = await api("POST", "/challans", token, {
    customerId,
    status: "DRAFT",
    items: [{ productId, quantity: 1000 }],
  });
  const t9 = await api("POST", `/challans/${draftFail.data.data.id}/confirm`, token);
  const stock9 = await api("GET", `/products/${productId}`, token);
  const ch9 = await api("GET", `/challans/${draftFail.data.data.id}`, token);
  assert(
    t9.status === 400 && stock9.data.data.currentStock === 60 && ch9.data.data.status === "DRAFT",
    "TEST9 insufficient stock rejected"
  );

  const low = await api("POST", "/products", token, {
    productName: "Low Stock Item",
    sku: `SCN-LOW-${Date.now()}`,
    category: "Test",
    unitPrice: 50,
    currentStock: 2,
    minimumStockAlertQuantity: 1,
    warehouseLocation: "B1",
  });
  const multi = await api("POST", "/challans", token, {
    customerId,
    status: "DRAFT",
    items: [
      { productId, quantity: 1 },
      { productId: low.data.data.id, quantity: 50 },
    ],
  });
  const t10 = await api("POST", `/challans/${multi.data.data.id}/confirm`, token);
  const s1 = await api("GET", `/products/${productId}`, token);
  const s2 = await api("GET", `/products/${low.data.data.id}`, token);
  assert(
    t10.status === 400 && s1.data.data.currentStock === 60 && s2.data.data.currentStock === 2,
    "TEST10 multi-product rollback"
  );

  const snapDraft = await api("POST", "/challans", token, {
    customerId,
    status: "DRAFT",
    items: [{ productId, quantity: 1 }],
  });
  await api("PUT", `/products/${productId}`, token, {
    productName: "Scenario Monitor RENAMED",
    sku: t5.data.data.sku,
    category: "Displays",
    unitPrice: 200,
    minimumStockAlertQuantity: 10,
    warehouseLocation: "A1",
  });
  const snapView = await api("GET", `/challans/${snapDraft.data.data.id}`, token);
  assert(
    snapView.data.data.items[0].productName === "Scenario Monitor" &&
      Number(snapView.data.data.items[0].unitPrice) === 100,
    "TEST11 product snapshot preserved"
  );

  const sales = await login("sales@test.com", "Sales@123");
  const t12 = await api("POST", "/products", sales.body.data.token, {
    productName: "X",
    sku: `X-${Date.now()}`,
    category: "X",
    unitPrice: 1,
    warehouseLocation: "Z",
  });
  assert(t12.status === 403, "TEST12 sales cannot create product");

  const t13 = await api("GET", "/customers?page=1&limit=2", token);
  assert(t13.data.pagination.limit === 2 && t13.data.pagination.total >= 1, "TEST13 pagination");

  const t14 = await api("POST", `/products/${productId}/stock-in`, token, {
    quantity: 0,
    reason: "bad",
  });
  assert(t14.status === 400, "TEST14 validation rejects qty 0");

  console.log("\nALL MANDATORY TESTS PASSED");
}

main().catch((e) => {
  console.error("FAILED", e);
  process.exit(1);
});
