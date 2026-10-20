// test-api.js - สคริปต์ทดสอบ API อัตโนมัติ (Automated API Test Suite)
// สำหรับวิชา CS261: ตรวจสอบการทำงานของ Endpoints ทุกตัวตาม User Stories U1 - U5

const BASE_URL = process.env.API_URL || 'http://localhost:5000/api';

async function runTests() {
  console.log('====================================================');
  console.log('  🧪 เริ่มต้นทดสอบ API: HiwKaw TU Rangsit (Sprint 1)  ');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;
  let authToken = null;

  async function test(name, fn) {
    try {
      process.stdout.write(`กำลังทดสอบ: ${name} ... `);
      await fn();
      console.log('✅ ผ่าน (PASSED)');
      passed++;
    } catch (err) {
      console.log(`❌ ไม่ผ่าน (FAILED): ${err.message}`);
      failed++;
    }
  }

  // 1. Health Check
  await test('1. Health Check (GET /api/health)', async () => {
    const res = await fetch(`${BASE_URL}/health`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (data.status !== 'online') throw new Error('Status not online');
  });

  // 2. ดึงรายการโรงอาหาร (U3)
  await test('2. ดึงข้อมูล 2 โรงอาหาร (GET /api/canteens)', async () => {
    const res = await fetch(`${BASE_URL}/canteens`);
    const data = await res.json();
    if (!data.success || data.data.length !== 2) throw new Error('โรงอาหารไม่ครบ 2 แห่ง');
    const green = data.data.find(c => c.id === 'green');
    const sci = data.data.find(c => c.id === 'sci');
    if (!green || !sci) throw new Error('ไม่พบข้อมูลกรีนแคนทีนหรือคณะวิทย์');
  });

  // 3. ดึงรายการร้านค้าทั้งหมด (U1)
  await test('3. ดึงรายการร้านค้าทั้งหมด (GET /api/shops)', async () => {
    const res = await fetch(`${BASE_URL}/shops`);
    const data = await res.json();
    if (!data.success || data.data.length < 10) throw new Error('จำนวนร้านค้าน้อยกว่า 10 ร้าน');
  });

  // 4. ค้นหาชื่อเมนู "กะเพรา" (U2)
  await test('4. ค้นหาชื่อเมนู "กะเพรา" (GET /api/shops?q=กะเพรา)', async () => {
    const res = await fetch(`${BASE_URL}/shops?q=${encodeURIComponent('กะเพรา')}`);
    const data = await res.json();
    if (!data.success || data.data.length === 0) throw new Error('ค้นหาเมนูกะเพราไม่พบ');
    const hasKaprao = data.data.some(s => s.name.includes('คุณยาย') || JSON.stringify(s.menus).includes('กะเพรา'));
    if (!hasKaprao) throw new Error('ผลลัพธ์ไม่ตรงกับเมนูกะเพรา');
  });

  // 5. ฟิลเตอร์เฉพาะโรงอาหารกรีนแคนทีน (U2)
  await test('5. ฟิลเตอร์เฉพาะ "กรีนแคนทีน" (GET /api/shops?canteen=green)', async () => {
    const res = await fetch(`${BASE_URL}/shops?canteen=green`);
    const data = await res.json();
    if (!data.success || data.data.length === 0) throw new Error('ไม่พบร้านในกรีนแคนทีน');
    const allGreen = data.data.every(s => s.canteen === 'green');
    if (!allGreen) throw new Error('พบร้านที่ไม่ได้อยู่กรีนแคนทีนปะปนมา');
  });

  // 6. ล็อกอินแม่ค้า: ร้านป้าณี ข้าวราดแกง (U4)
  await test('6. เข้าสู่ระบบแม่ค้า เบอร์ 0811111111 PIN 1111 (POST /api/auth/login)', async () => {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: '0811111111', pin: '1111' })
    });
    const data = await res.json();
    if (!data.success || !data.token) throw new Error('ล็อกอินไม่สำเร็จหรือไม่มี Token');
    authToken = data.token;
  });

  // 7. สลับสถานะร้านเป็น "ปิดร้าน" (U5)
  await test('7. สลับสถานะร้านป้าณีเป็น "ปิดร้าน" (PUT /api/shops/shop-green-01/status)', async () => {
    if (!authToken) throw new Error('ไม่มี Token สำหรับยืนยันตัวตน');
    const res = await fetch(`${BASE_URL}/shops/shop-green-01/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({ isOpen: false, statusNote: 'ทดสอบปิดร้านด้วย API' })
    });
    const data = await res.json();
    if (!data.success || data.data.isOpen !== false) throw new Error('สถานะร้านไม่เปลี่ยนเป็น false');
  });

  // 8. สลับสถานะร้านกลับเป็น "เปิดร้าน" (U5)
  await test('8. สลับสถานะร้านป้าณีกลับเป็น "เปิดร้าน" (PUT /api/shops/shop-green-01/status)', async () => {
    if (!authToken) throw new Error('ไม่มี Token สำหรับยืนยันตัวตน');
    const res = await fetch(`${BASE_URL}/shops/shop-green-01/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({ isOpen: true, statusNote: 'เปิดปกติ มีกับข้าวร้อนๆ กว่า 15 อย่าง' })
    });
    const data = await res.json();
    if (!data.success || data.data.isOpen !== true) throw new Error('สถานะร้านไม่เปลี่ยนกลับเป็น true');
  });

  console.log('\n====================================================');
  console.log(`  📊 ผลการทดสอบทั้งหมด: ผ่าน ${passed}/${passed + failed} ข้อ`);
  if (failed === 0) {
    console.log('  🎉 API ทุกเส้นทำงานสมบูรณ์ 100% พร้อมนำเสนอ CS261!');
  } else {
    console.log(`  ⚠️ มีข้อที่ต้องตรวจสอบเพิ่มเติม ${failed} ข้อ`);
  }
  console.log('====================================================\n');
}

runTests();
