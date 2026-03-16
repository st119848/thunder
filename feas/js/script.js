// Utilities
const fmt = (num) => new Intl.NumberFormat('th-TH', { maximumFractionDigits: 0 }).format(num);
const fmtPct = (num) => new Intl.NumberFormat('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(num);

let revChartInstance = null;
let plChartInstance = null;
let unitChartInstance = null;
let cumChartInstance = null;

// Scenarios Data
const scenarios = {
    balanced: {
        v_platform: 50, v_investor: 100, v_p2p: 200,
        r_rto_day: 500, gp_investor: 15, r_share_hr: 100, share_hr_usage: 5,
        r_share_day: 1200, gp_share: 25, r_hail_day: 1500, gp_hail: 20,
        c_car_install: 12000, c_car_maint: 2500, c_tech: 150000, c_mkt: 200000, c_staff: 300000
    },
    conservative: {
        v_platform: 20, v_investor: 50, v_p2p: 100,
        r_rto_day: 450, gp_investor: 10, r_share_hr: 80, share_hr_usage: 3,
        r_share_day: 1000, gp_share: 20, r_hail_day: 1200, gp_hail: 15,
        c_car_install: 11000, c_car_maint: 2000, c_tech: 100000, c_mkt: 50000, c_staff: 200000
    },
    aggressive: {
        v_platform: 200, v_investor: 300, v_p2p: 500,
        r_rto_day: 550, gp_investor: 18, r_share_hr: 120, share_hr_usage: 6,
        r_share_day: 1400, gp_share: 30, r_hail_day: 1800, gp_hail: 25,
        c_car_install: 13000, c_car_maint: 3000, c_tech: 300000, c_mkt: 1000000, c_staff: 800000
    },
    'asset-light': {
        v_platform: 5, v_investor: 150, v_p2p: 1000,
        r_rto_day: 600, gp_investor: 20, r_share_hr: 100, share_hr_usage: 4,
        r_share_day: 1200, gp_share: 25, r_hail_day: 1500, gp_hail: 20,
        c_car_install: 15000, c_car_maint: 3500, c_tech: 250000, c_mkt: 400000, c_staff: 400000
    },
    premium: {
        v_platform: 100, v_investor: 50, v_p2p: 50,
        r_rto_day: 1200, gp_investor: 25, r_share_hr: 250, share_hr_usage: 8,
        r_share_day: 2500, gp_share: 35, r_hail_day: 3000, gp_hail: 30,
        c_car_install: 25000, c_car_maint: 5000, c_tech: 200000, c_mkt: 500000, c_staff: 500000
    }
};

const carModels = {
    byd_seal: {
        c_car_down: 240000, // 20% of 1.2M
        c_car_install: 18000,
        c_car_maint: 3500
    },
    axios: {
        c_car_down: 200000, // 20% of 1M
        c_car_install: 15000,
        c_car_maint: 3000
    },
    standard: {
        c_car_down: 170000, // 20% of 850k
        c_car_install: 12000,
        c_car_maint: 2500
    }
};

function applyCarModel() {
    const selected = document.getElementById('car-model-preset').value;
    if (selected === 'custom') return;
    
    const data = carModels[selected];
    for (let key in data) {
        const el = document.getElementById(key);
        if (el) el.value = data[key];
    }
    calculate();
}

function applyRoleCar(selectId) {
    const selected = document.getElementById(selectId).value;
    const priceMap = {
        byd_seal: 1200000,
        axios: 1000000,
        standard: 850000
    };
    
    if (selectId === 'p_dr_car_select') {
        document.getElementById('p_dr_car_price').value = priceMap[selected];
        const dailyRent = Math.ceil((priceMap[selected] * 1.25) / (5 * 365));
        document.getElementById('p_dr_rent').value = dailyRent;
        updateDriverView();
    } else if (selectId === 'p_dr_hr_car_select') {
        const hourlyRentMap = { byd_seal: 150, axios: 120, standard: 100 };
        document.getElementById('p_dr_hr_rent').value = hourlyRentMap[selected];
        updateDriverHrView();
    } else if (selectId === 'p_inv_car_select') {
        const carData = carModels[selected];
        document.getElementById('p_inv_price').value = priceMap[selected];
        document.getElementById('p_inv_down').value = carData.c_car_down;
        updateInvestorView();
    } else if (selectId === 'p_fleet_car_select') {
        const rateMap = { byd_seal: 1800, axios: 1500, standard: 1200 };
        document.getElementById('p_fleet_rate').value = rateMap[selected];
        updatePartnerFleetView();
    } else if (selectId === 'p_dealer_car_select') {
        updatePartnerDealerView();
    }
}

function applyDriverPreset() {
    const val = document.getElementById('p_dr_preset').value;
    if (val === 'part_time') document.getElementById('p_dr_hours').value = 4;
    if (val === 'full_time') document.getElementById('p_dr_hours').value = 10;
    if (val === 'hardworking') document.getElementById('p_dr_hours').value = 12;
    updateDriverView();
}

function applyDriverHrPreset() {
    const val = document.getElementById('p_dr_hr_preset').value;
    if (val === 'short') document.getElementById('p_dr_hr_hours').value = 4;
    if (val === 'standard') document.getElementById('p_dr_hr_hours').value = 8;
    if (val === 'long') document.getElementById('p_dr_hr_hours').value = 10;
    updateDriverHrView();
}

function applyInvestorPreset() {
    const val = document.getElementById('p_inv_preset').value;
    if (val === 'starter') document.getElementById('p_inv_count').value = 2;
    if (val === 'medium') document.getElementById('p_inv_count').value = 10;
    if (val === 'pro') document.getElementById('p_inv_count').value = 50;
    updateInvestorView();
}

function applyFleetPreset() {
    const val = document.getElementById('p_fleet_preset').value;
    if (val === 'local') document.getElementById('p_fleet_v').value = 20;
    if (val === 'regional') document.getElementById('p_fleet_v').value = 100;
    if (val === 'national') document.getElementById('p_fleet_v').value = 500;
    updatePartnerFleetView();
}

function applyDealerPreset() {
    const val = document.getElementById('p_dealer_preset').value;
    if (val === 'conservative') document.getElementById('p_dealer_sales').value = 100;
    if (val === 'aggressive') document.getElementById('p_dealer_sales').value = 500;
    updatePartnerDealerView();
}

function switchView(view) {
    // Update Menu Active State
    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
    const activeNav = [...document.querySelectorAll('.nav-item')].find(el => {
        if(view === 'exec') return el.innerText.includes('ผู้บริหาร');
        if(view === 'driver') return el.innerText.includes('เช่าซื้อ');
        if(view === 'driver-hr') return el.innerText.includes('ราย ชม.');
        if(view === 'investor') return el.innerText.includes('นักลงทุน');
        if(view === 'p-fleet') return el.getAttribute('onclick').includes('p-fleet');
        if(view === 'p-dealer') return el.getAttribute('onclick').includes('p-dealer');
    });
    if(activeNav) activeNav.classList.add('active');

    // Toggle Visibility
    document.querySelectorAll('.persona-view').forEach(el => el.classList.remove('active'));
    const target = document.getElementById('view-' + view);
    if(target) target.classList.add('active');

    // Update respective view data
    if(view === 'driver') updateDriverView();
    if(view === 'driver-hr') updateDriverHrView();
    if(view === 'investor') updateInvestorView();
    if(view === 'p-fleet') updatePartnerFleetView();
    if(view === 'p-dealer') updatePartnerDealerView();
}

function updateDriverView() {
    const hr = parseFloat(document.getElementById('p_dr_hours').value) || 0;
    const rate = parseFloat(document.getElementById('p_dr_rate').value) || 0;
    const rent = parseFloat(document.getElementById('p_dr_rent').value) || 0;
    const price = parseFloat(document.getElementById('p_dr_car_price').value) || 800000;

    const gross = hr * rate;
    const net = gross - rent;
    
    document.getElementById('p_dr_gross').innerText = '฿' + fmt(gross);
    document.getElementById('p_dr_cost_tag').innerText = '฿' + fmt(rent);
    document.getElementById('p_dr_net').innerText = '฿' + fmt(net);
    document.getElementById('p_dr_month').innerText = '฿' + fmt(net * 30);
    
    const netEl = document.getElementById('p_dr_net');
    netEl.style.color = net >= 0 ? '#10b981' : '#ef4444';
}

function updateDriverHrView() {
    const hr = parseFloat(document.getElementById('p_dr_hr_hours').value) || 0;
    const rentHr = parseFloat(document.getElementById('p_dr_hr_rent').value) || 0;
    const rate = parseFloat(document.getElementById('p_dr_hr_rate').value) || 0;
    
    const gross = hr * rate;
    const cost = hr * rentHr;
    const net = gross - cost;
    
    document.getElementById('p_dr_hr_gross').innerText = '฿' + fmt(gross);
    document.getElementById('p_dr_hr_cost').innerText = '฿' + fmt(cost);
    document.getElementById('p_dr_hr_net').innerText = '฿' + fmt(net);
}

function updateInvestorView() {
    const count = parseFloat(document.getElementById('p_inv_count').value) || 0;
    const price = parseFloat(document.getElementById('p_inv_price').value) || 0;
    const down = parseFloat(document.getElementById('p_inv_down').value) || 0;
    
    const rtoDay = 500;
    const gpInv = 15;
    
    const incomePerCar = (rtoDay * 30 * 0.95); 
    const margin = incomePerCar * ((100 - gpInv) / 100); 
    
    const totalPassive = margin * count;
    const totalInv = (down) * count;
    const roi = totalInv > 0 ? (totalPassive * 12 / totalInv) * 100 : 0;

    document.getElementById('p_inv_passive').innerText = '฿' + fmt(totalPassive);
    document.getElementById('p_inv_total').innerText = '฿' + fmt(totalInv);
    document.getElementById('p_inv_roi').innerText = fmtPct(roi) + '%';
    
    // Table for 5 years
    let tblHtml = '';
    let cum = -totalInv;
    for(let y=1; y<=5; y++) {
        const yrProf = totalPassive * 12;
        cum += yrProf;
        tblHtml += `<tr><td>ปีที่ ${y}</td><td class="text-success">${fmt(yrProf)}</td><td class="${cum>=0?'text-success':'text-danger'}">${fmt(cum)}</td></tr>`;
    }
    document.getElementById('p_inv_tbl_5y').innerHTML = tblHtml;
}

function updatePartnerFleetView() {
    const v = parseFloat(document.getElementById('p_fleet_v').value) || 0;
    const days = parseFloat(document.getElementById('p_fleet_days').value) || 0;
    const rate = parseFloat(document.getElementById('p_fleet_rate').value) || 0;
    const feePercent = parseFloat(document.getElementById('p_fleet_fee').value) || 0;
    const model = document.getElementById('p_fleet_model').value;
    
    // Manage dynamic input visibility
    const platformInputs = document.getElementById('fleet-platform-inputs');
    if (platformInputs) {
        platformInputs.style.display = model === 'platform' ? 'block' : 'none';
    }

    const gross = v * days * rate;
    const platformFee = gross * (feePercent / 100);
    
    let netPartner = 0;
    if (model === 'owner') {
        // Owner gets everything after our platform fee
        netPartner = gross - platformFee;
    } else {
        // Platform (Asset-Light) gets a management cut (GP they charge their owners)
        const mgmtGP = parseFloat(document.getElementById('p_fleet_mgmt_gp').value) || 0;
        netPartner = gross * (mgmtGP / 100);
    }
    
    document.getElementById('p_fleet_gross').innerText = '฿' + fmt(gross);
    document.getElementById('p_fleet_fee_val').innerText = '฿' + fmt(platformFee);
    document.getElementById('p_fleet_net').innerText = '฿' + fmt(netPartner);
    document.getElementById('p_fleet_year').innerText = '฿' + fmt(netPartner * 12);

    // Update Label dynamically for clarity
    const netLabel = document.querySelector('#view-p-fleet .card-profit h3');
    if (netLabel) {
        netLabel.innerText = model === 'owner' ? 'รายได้สุทธิเจ้าของ Fleet' : 'ค่าบริหารจัดการ (Platform GP)';
    }
}

function updatePartnerDealerView() {
    const salesCount = parseFloat(document.getElementById('p_dealer_sales').value) || 0;
    const serviceRate = parseFloat(document.getElementById('p_dealer_service').value) || 0;
    const carPrice = 800000;
    
    const totalSales = salesCount * carPrice;
    const totalService = salesCount * serviceRate * 12;
    
    document.getElementById('p_dealer_total_sales').innerText = '฿' + fmt(totalSales);
    document.getElementById('p_dealer_total_service').innerText = '฿' + fmt(totalService);

    // Realistic Growth Metrics
    const boost = salesCount > 0 ? (salesCount / 100) + 1.5 : 0;
    document.getElementById('p_dealer_turnover').innerText = boost.toFixed(1) + 'x';

    const reach = salesCount > 0 ? 72 : 0;
    document.getElementById('p_dealer_reach').innerText = reach + '%';

    const loyalty = salesCount > 0 ? 85 : 0;
    document.getElementById('p_dealer_loyalty').innerText = loyalty + '%';
}

function applyScenario() {
    const selected = document.getElementById('scenario-preset').value;
    const data = scenarios[selected];
    
    for (let key in data) {
        const el = document.getElementById(key);
        if (el) el.value = data[key];
    }
    
    calculate();
}

function calculate() {
    // 1. Get Inputs
    const v_platform = parseFloat(document.getElementById('v_platform').value) || 0;
    const v_investor = parseFloat(document.getElementById('v_investor').value) || 0;
    const v_p2p = parseFloat(document.getElementById('v_p2p').value) || 0;

    const r_rto_day = parseFloat(document.getElementById('r_rto_day').value) || 0;
    const r_share_hr = parseFloat(document.getElementById('r_share_hr').value) || 0;
    const share_hr_usage = parseFloat(document.getElementById('share_hr_usage').value) || 0;
    const r_share_day = parseFloat(document.getElementById('r_share_day').value) || 0;
    const r_hail_day = parseFloat(document.getElementById('r_hail_day').value) || 0;

    const gp_investor = parseFloat(document.getElementById('gp_investor').value) || 0;
    const gp_share = parseFloat(document.getElementById('gp_share').value) || 0;
    const gp_hail = parseFloat(document.getElementById('gp_hail').value) || 0;

    const c_car_down = parseFloat(document.getElementById('c_car_down').value) || 0;
    const c_setup = parseFloat(document.getElementById('c_setup').value) || 0;
    const c_car_install = parseFloat(document.getElementById('c_car_install').value) || 0;
    const c_car_maint = parseFloat(document.getElementById('c_car_maint').value) || 0;
    const c_tech = parseFloat(document.getElementById('c_tech').value) || 0;
    const c_mkt = parseFloat(document.getElementById('c_mkt').value) || 0;
    const c_staff = parseFloat(document.getElementById('c_staff').value) || 0;

    const g_rev = parseFloat(document.getElementById('g_rev').value) || 0;
    const g_cost = parseFloat(document.getElementById('g_cost').value) || 0;

    const gp_ins = parseFloat(document.getElementById('gp_ins').value) || 0;
    const r_saas = parseFloat(document.getElementById('r_saas').value) || 0;
    const ai_boost = parseFloat(document.getElementById('ai_boost').value) || 0;
    document.getElementById('ai_boost_val').innerText = ai_boost + '%';

    // 2. Constants & Assumptions
    const daysInMonth = 30;
    const rtoUtil = 0.95;
    const p2pUtilDays = 18;

    // 3. Calculate Revenues (Monthly)
    const boostFactor = 1 + (ai_boost / 100);
    
    const revPlatformRTO = (v_platform * r_rto_day * daysInMonth * rtoUtil);
    const revInvestorRTO = (v_investor * r_rto_day * daysInMonth * rtoUtil) * (gp_investor / 100);

    const p2pSplit = v_p2p / 3;
    const revHailing = (p2pSplit * r_hail_day * p2pUtilDays * (gp_hail / 100)) * boostFactor;
    const revShareDay = (p2pSplit * r_share_day * p2pUtilDays * (gp_share / 100)) * boostFactor;
    const revShareHr = (p2pSplit * (r_share_hr * share_hr_usage) * p2pUtilDays * (gp_share / 100)) * boostFactor;

    const baseRev = revPlatformRTO + revInvestorRTO + revHailing + revShareDay + revShareHr;
    const revInsurance = (baseRev * (gp_ins / 100)); 
    const revSaaS = (v_investor + v_p2p) * r_saas;

    const totalRev = baseRev + revInsurance + revSaaS;

    // 4. Calculate Costs (Monthly)
    const costInstallment = v_platform * c_car_install;
    const costMaint = v_platform * c_car_maint;
    const totalCost = costInstallment + costMaint + c_tech + c_mkt + c_staff;

    const netProfit = totalRev - totalCost;
    const netMargin = totalRev > 0 ? (netProfit / totalRev) * 100 : 0;

    // 5. Investment Calculations
    const initialInvestment = (v_platform * c_car_down) + c_setup;
    const annualProfit = netProfit * 12;
    const roi = initialInvestment > 0 ? (annualProfit / initialInvestment) * 100 : 0;
    const paybackPeriod = netProfit > 0 ? (initialInvestment / netProfit) / 12 : 0;

    // 6. Update UI Cards
    document.getElementById('sum_rev').innerText = '฿' + fmt(totalRev);
    document.getElementById('sum_cost').innerText = '฿' + fmt(totalCost);
    document.getElementById('sum_profit').innerText = '฿' + fmt(netProfit);

    const roiEl = document.getElementById('roi_val');
    roiEl.innerText = fmtPct(roi) + '%';
    roiEl.className = roi >= 0 ? 'value text-success' : 'value text-danger';

    document.getElementById('init_cap').innerText = '฿' + fmt(initialInvestment);
    document.getElementById('payback_val').innerText = paybackPeriod > 0 ? fmtPct(paybackPeriod) + ' ปี' : 'N/A';

    const yearProfitEl = document.getElementById('year_profit');
    yearProfitEl.innerText = '฿' + fmt(annualProfit);
    yearProfitEl.className = annualProfit >= 0 ? 'value text-success' : 'value text-danger';
    
    document.getElementById('year_cost').innerText = '฿' + fmt(totalCost * 12);
    document.getElementById('year_margin').innerText = fmtPct(netMargin) + '%';

    // 6. Update Tables
    document.getElementById('tbl_rev').innerHTML = `
        <tr><td>1. RTO รถแพลตฟอร์ม</td><td class="text-success">${fmt(revPlatformRTO)}</td><td class="text-success">${fmt(revPlatformRTO * 12)}</td></tr>
        <tr><td>2. RTO รถนักลงทุน (GP ${gp_investor}%)</td><td class="text-success">${fmt(revInvestorRTO)}</td><td class="text-success">${fmt(revInvestorRTO * 12)}</td></tr>
        <tr><td>3. Ride-Hailing (AI Boosted)</td><td class="text-success">${fmt(revHailing)}</td><td class="text-success">${fmt(revHailing * 12)}</td></tr>
        <tr><td>4. Car Sharing (AI Boosted)</td><td class="text-success">${fmt(revShareDay + revShareHr)}</td><td class="text-success">${fmt((revShareDay + revShareHr) * 12)}</td></tr>
        <tr><td>5. On-demand Insurance (GP ${gp_ins}%)</td><td class="text-success">${fmt(revInsurance)}</td><td class="text-success">${fmt(revInsurance * 12)}</td></tr>
        <tr><td>6. B2B SaaS Subscription</td><td class="text-success">${fmt(revSaaS)}</td><td class="text-success">${fmt(revSaaS * 12)}</td></tr>
        <tr class="row-total"><td>รวมรายรับ</td><td class="text-success">฿${fmt(totalRev)}</td><td class="text-success">฿${fmt(totalRev * 12)}</td></tr>
    `;

    const avgDriverRev = r_hail_day * 25; 
    const driverNet = avgDriverRev - (r_rto_day * 30) - (avgDriverRev * (gp_hail/100));
    document.getElementById('stk_driver').innerText = '฿' + fmt(driverNet);

    const investorNet = (r_rto_day * 30 * rtoUtil) * ((100 - gp_investor) / 100);
    document.getElementById('stk_investor').innerText = '฿' + fmt(investorNet);

    document.getElementById('tbl_cost').innerHTML = `
        <tr><td>1. ค่างวดรถแพลตฟอร์ม (Asset)</td><td class="text-danger">${fmt(costInstallment)}</td><td class="text-danger">${fmt(costInstallment * 12)}</td></tr>
        <tr><td>2. ประกัน & ซ่อมบำรุง</td><td class="text-danger">${fmt(costMaint)}</td><td class="text-danger">${fmt(costMaint * 12)}</td></tr>
        <tr><td>3. Tech & Digital Safety Platform</td><td class="text-danger">${fmt(c_tech)}</td><td class="text-danger">${fmt(c_tech * 12)}</td></tr>
        <tr><td>4. งบการตลาด</td><td class="text-danger">${fmt(c_mkt)}</td><td class="text-danger">${fmt(c_mkt * 12)}</td></tr>
        <tr><td>5. เงินเดือนทีมงาน (Operations)</td><td class="text-danger">${fmt(c_staff)}</td><td class="text-danger">${fmt(c_staff * 12)}</td></tr>
        <tr class="row-total"><td>รวมรายจ่าย</td><td class="text-danger">฿${fmt(totalCost)}</td><td class="text-danger">฿${fmt(totalCost * 12)}</td></tr>
    `;

    let projHtml = '';
    let cumulativeCash = -initialInvestment;
    for (let m = 1; m <= 12; m++) {
        const prevCash = cumulativeCash;
        cumulativeCash += netProfit;
        const isPayback = prevCash < 0 && cumulativeCash >= 0;

        projHtml += `
            <tr class="${isPayback ? 'row-total' : ''}">
                <td>เดือนที่ ${m} ${isPayback ? '<span style="font-size:1.2rem">✅</span>' : ''}</td>
                <td class="text-success">${fmt(totalRev)}</td>
                <td class="text-danger">${fmt(totalCost)}</td>
                <td class="${netProfit >= 0 ? 'text-success' : 'text-danger'}">${fmt(netProfit)}</td>
                <td class="${cumulativeCash >= 0 ? 'text-success' : 'text-danger'}" style="font-weight:bold">${fmt(cumulativeCash)}</td>
            </tr>
        `;
    }
    document.getElementById('tbl_projection').innerHTML = projHtml;

    let yearHtml = '';
    let cumYearCash = -initialInvestment;
    let currentYearRev = totalRev * 12;
    let currentYearCost = totalCost * 12;

    for (let y = 1; y <= 5; y++) {
        const yearProfit = currentYearRev - currentYearCost;
        cumYearCash += yearProfit;
        
        yearHtml += `
            <tr>
                <td>ปีที่ ${y}</td>
                <td class="text-success">${fmt(currentYearRev)}</td>
                <td class="text-danger">${fmt(currentYearCost)}</td>
                <td class="${yearProfit >= 0 ? 'text-success' : 'text-danger'}">${fmt(yearProfit)}</td>
                <td class="${cumYearCash >= 0 ? 'text-success' : 'text-danger'}" style="font-weight:bold">${fmt(cumYearCash)}</td>
            </tr>
        `;
        
        currentYearRev *= (1 + g_rev / 100);
        currentYearCost *= (1 + g_cost / 100);
    }
    document.getElementById('tbl_5year').innerHTML = yearHtml;

    updateCharts(
        [revPlatformRTO, revInvestorRTO, revHailing, revShareDay, revShareHr],
        totalRev, totalCost, netProfit,
        {
            platform: v_platform > 0 ? (revPlatformRTO - (costInstallment + costMaint)) / v_platform : 0,
            investor: v_investor > 0 ? revInvestorRTO / v_investor : 0,
            p2p: v_p2p > 0 ? (revHailing + revShareDay + revShareHr) / v_p2p : 0
        }
    );
}

function updateCharts(revDataArray, totalRev, totalCost, netProfit, unitData) {
    const ctxRev = document.getElementById('revChart').getContext('2d');
    if (revChartInstance) revChartInstance.destroy();
    revChartInstance = new Chart(ctxRev, {
        type: 'doughnut',
        data: {
            labels: ['RTO แพลตฟอร์ม', 'RTO นักลงทุน', 'Ride-Hailing', 'Sharing รายวัน', 'Sharing รายชม.'],
            datasets: [{
                data: revDataArray,
                backgroundColor: ['#2563eb', '#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe'],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: { display: true, text: 'สัดส่วนรายได้ (Revenue Breakdown)', font: { size: 16, family: 'Sarabun' } },
                legend: { position: 'right', labels: { font: { family: 'Sarabun' } } }
            }
        }
    });

    const ctxPL = document.getElementById('plChart').getContext('2d');
    if (plChartInstance) plChartInstance.destroy();
    plChartInstance = new Chart(ctxPL, {
        type: 'bar',
        data: {
            labels: ['รายรับรวม (Rev)', 'รายจ่ายรวม (Cost)', 'กำไรสุทธิ (Profit)'],
            datasets: [{
                label: 'THB / เดือน',
                data: [totalRev, totalCost, netProfit],
                backgroundColor: ['#3b82f6', '#f43f5e', netProfit >= 0 ? '#10b981' : '#ef4444'],
                borderRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: { display: true, text: 'ภาพรวมกำไร-ขาดทุน ต่อเดือน (P&L)', font: { size: 16, family: 'Sarabun' } },
                legend: { display: false }
            },
            scales: { 
                y: { beginAtZero: true, ticks: { font: { family: 'Sarabun' } } },
                x: { ticks: { font: { family: 'Sarabun' } } }
            }
        }
    });

    const ctxUnit = document.getElementById('unitChart').getContext('2d');
    if (unitChartInstance) unitChartInstance.destroy();
    unitChartInstance = new Chart(ctxUnit, {
        type: 'bar',
        data: {
            labels: ['Platform RTO', 'Investor RTO', 'P2P / Partner'],
            datasets: [{
                label: 'กำไรสุทธิ / คัน / เดือน',
                data: [unitData.platform, unitData.investor, unitData.p2p],
                backgroundColor: ['#1e3a8a', '#3b82f6', '#93c5fd'],
                borderRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            indexAxis: 'y',
            plugins: {
                title: { display: true, text: 'ประสิทธิภาพกำไร (Profit per Unit / Mo)', font: { size: 16, family: 'Sarabun' } },
                legend: { display: false }
            },
            scales: { x: { beginAtZero: true, ticks: { font: { family: 'Sarabun' } } }, y: { ticks: { font: { family: 'Sarabun' } } } }
        }
    });

    const ctxCum = document.getElementById('cumChart').getContext('2d');
    if (cumChartInstance) cumChartInstance.destroy();
    const monthlyData = Array.from({length: 12}, (_, i) => netProfit * (i + 1));
    cumChartInstance = new Chart(ctxCum, {
        type: 'line',
        data: {
            labels: ['M1', 'M2', 'M3', 'M4', 'M5', 'M6', 'M7', 'M8', 'M9', 'M10', 'M11', 'M12'],
            datasets: [{
                label: 'กำไรสะสม (Cumulative Profit)',
                data: monthlyData,
                borderColor: '#10b981',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: { display: true, text: 'ประมาณการกำไรสะสมใน 1 ปี (Cumulative)', font: { size: 16, family: 'Sarabun' } },
                legend: { display: false }
            },
            scales: { 
                y: { beginAtZero: true, ticks: { font: { family: 'Sarabun' } } },
                x: { ticks: { font: { family: 'Sarabun' } } }
            }
        }
    });
}

function downloadScreenshot() {
    const btn = document.querySelector('.btn-download');
    const originalText = btn.innerHTML;
    btn.innerHTML = 'กำลังประมวลผล...';
    btn.style.opacity = '0.7';
    btn.disabled = true;

    html2canvas(document.body, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#f1f5f9',
        ignoreElements: (element) => element.classList.contains('btn-download')
    }).then(canvas => {
        const link = document.createElement('a');
        const date = new Date().toISOString().slice(0, 10);
        link.download = `Mobility-Dashboard-Projection-${date}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
        btn.innerHTML = originalText;
        btn.style.opacity = '1';
        btn.disabled = false;
    }).catch(err => {
        console.error('Screenshot failed:', err);
        alert('ไม่สามารถดาวน์โหลดรูปภาพได้ในขณะนี้');
        btn.innerHTML = originalText;
        btn.style.opacity = '1';
        btn.disabled = false;
    });
}

window.onload = function() {
    calculate();
    // Also trigger persona views if they need initial data
    updateDriverView();
    updateDriverHrView();
    updateInvestorView();
    updatePartnerFleetView();
    updatePartnerDealerView();
};
