const mockData = {
  users: [
    { id: 'usr-001', name: 'Alexander Wright', email: 'admin@toolrental.com', role: 'Admin', phone: '+1 555-0192', status: 'Active' },
    { id: 'usr-002', name: 'Sarah Jenkins', email: 'manager@toolrental.com', role: 'Manager', phone: '+1 555-0144', status: 'Active' },
    { id: 'usr-003', name: 'David Miller', email: 'customer@buildtech.com', role: 'Customer', phone: '+1 555-0188', status: 'Active' }
  ],
  categories: [
    { id: 'cat-001', code: 'PWR', name: 'Power Tools', description: 'Heavy-duty electric & battery power equipment', icon: 'Zap', status: 'Active' },
    { id: 'cat-002', code: 'HDW', name: 'Heavy Machinery', description: 'Excavators, compactors, and loaders', icon: 'Truck', status: 'Active' },
    { id: 'cat-003', code: 'CON', name: 'Concrete & Masonry', description: 'Mixers, saws, and finishing tools', icon: 'Layers', status: 'Active' },
    { id: 'cat-004', code: 'LND', name: 'Lawn & Garden', description: 'Trimmers, tillers, and chippers', icon: 'Scissors', status: 'Active' },
    { id: 'cat-005', code: 'SFY', name: 'Scaffolding & Safety', description: 'Towers, ladders, and protective gear', icon: 'Shield', status: 'Active' }
  ],
  tools: [
    { id: 'tl-101', toolCode: 'TL-PWR-001', name: 'DeWalt 20V MAX Rotary Hammer Drill', category: 'Power Tools', categoryId: 'cat-001', brand: 'DeWalt', modelNumber: 'DCH273B', serialNumber: 'SN-99812-X', dailyRate: 35, depositAmount: 100, status: 'Available', condition: 'Excellent', description: 'Brushless SDS Plus rotary hammer drill' },
    { id: 'tl-102', toolCode: 'TL-HDW-002', name: 'Bobcat E20 Compact Excavator', category: 'Heavy Machinery', categoryId: 'cat-002', brand: 'Bobcat', modelNumber: 'E20-2023', serialNumber: 'BC-5541-M', dailyRate: 250, depositAmount: 500, status: 'Rented', condition: 'Good', description: 'Zero tail swing 2-ton compact excavator' },
    { id: 'tl-103', toolCode: 'TL-CON-003', name: 'Husqvarna K770 Concrete Saw 14"', category: 'Concrete & Masonry', categoryId: 'cat-003', brand: 'Husqvarna', modelNumber: 'K770-14', serialNumber: 'HQ-77123', dailyRate: 65, depositAmount: 150, status: 'Available', condition: 'Excellent', description: 'Gas power cutter for concrete and masonry' },
    { id: 'tl-104', toolCode: 'TL-PWR-004', name: 'Milwaukee Fuel 7-1/4" Circular Saw', category: 'Power Tools', categoryId: 'cat-001', brand: 'Milwaukee', modelNumber: '2732-20', serialNumber: 'MK-11203', dailyRate: 28, depositAmount: 80, status: 'Maintenance', condition: 'Needs Repair', description: 'Cordless circular saw requiring blade guard replacement' },
    { id: 'tl-105', toolCode: 'TL-SFY-005', name: 'Werner 6ft Aluminum Scaffold Tower', category: 'Scaffolding & Safety', categoryId: 'cat-005', brand: 'Werner', modelNumber: 'ST-600', serialNumber: 'WR-88910', dailyRate: 45, depositAmount: 120, status: 'Available', condition: 'Good', description: 'Heavy duty mobile scaffolding unit' }
  ],
  customers: [
    { id: 'cust-101', customerCode: 'CUST-001', fullName: 'David Miller', email: 'customer@buildtech.com', phone: '+1 555-0188', companyName: 'BuildTech Constructions', idProofType: 'NIC', idProofNumber: '921102948V', status: 'Active', notes: 'Preferred contractor client' },
    { id: 'cust-102', customerCode: 'CUST-002', fullName: 'Rachel Adams', email: 'radams@apexbuilders.io', phone: '+1 555-0133', companyName: 'Apex Builders LLC', idProofType: 'Driving License', idProofNumber: 'DL-8839201', status: 'Active', notes: 'Monthly billing customer' },
    { id: 'cust-103', customerCode: 'CUST-003', fullName: 'Kevin Vance', email: 'kvance@homeprojects.net', phone: '+1 555-0199', companyName: 'Vance Residential DIY', idProofType: 'Passport', idProofNumber: 'N8830192', status: 'Active', notes: 'Individual renter' }
  ],
  reservations: [
    { id: 'res-501', reservationCode: 'RES-2026-001', customerName: 'David Miller', toolName: 'Bobcat E20 Compact Excavator', startDate: '2026-08-10', endDate: '2026-08-15', totalDays: 5, totalEstimatedCost: 1250, status: 'Approved' },
    { id: 'res-502', reservationCode: 'RES-2026-002', customerName: 'Rachel Adams', toolName: 'DeWalt 20V MAX Rotary Hammer Drill', startDate: '2026-08-14', endDate: '2026-08-18', totalDays: 4, totalEstimatedCost: 140, status: 'Pending' },
    { id: 'res-503', reservationCode: 'RES-2026-003', customerName: 'Kevin Vance', toolName: 'Husqvarna K770 Concrete Saw 14"', startDate: '2026-08-20', endDate: '2026-08-22', totalDays: 2, totalEstimatedCost: 130, status: 'Pending' }
  ],
  transactions: [
    { id: 'tx-901', transactionCode: 'TX-2026-8801', customerName: 'David Miller', toolName: 'Bobcat E20 Compact Excavator', transactionType: 'Rental Issue', issueDate: '2026-08-10', expectedReturnDate: '2026-08-15', dailyRate: 250, depositPaid: 500, totalAmount: 1250, paymentStatus: 'Paid', paymentMethod: 'Card' },
    { id: 'tx-902', transactionCode: 'TX-2026-8802', customerName: 'Rachel Adams', toolName: 'Werner 6ft Aluminum Scaffold Tower', transactionType: 'Rental Return', issueDate: '2026-08-01', expectedReturnDate: '2026-08-05', actualReturnDate: '2026-08-05', dailyRate: 45, depositPaid: 120, totalAmount: 225, lateFee: 0, paymentStatus: 'Paid', paymentMethod: 'Bank Transfer' }
  ],
  quotations: [
    { id: 'qt-301', quotationNumber: 'QT-2026-011', customerName: 'Apex Builders LLC', totalAmount: 1850, validUntil: '2026-08-25', status: 'Sent', itemsCount: 3 },
    { id: 'qt-302', quotationNumber: 'QT-2026-012', customerName: 'BuildTech Constructions', totalAmount: 3400, validUntil: '2026-08-30', status: 'Approved', itemsCount: 5 }
  ],
  expenses: [
    { id: 'exp-101', title: 'Excavator Hydraulic Fluid & Filter Service', category: 'Maintenance & Repairs', amount: 320, expenseDate: '2026-08-08', status: 'Paid', vendor: 'Heavy Power Mechanics' },
    { id: 'exp-102', title: 'New Cordless Battery Packs Purchase', category: 'Tool Acquisition', amount: 750, expenseDate: '2026-08-05', status: 'Paid', vendor: 'DeWalt Industrial Distribution' }
  ],
  suppliers: [
    { id: 'sup-01', supplierCode: 'SUP-001', companyName: 'Industrial Power Supplies Inc.', contactPerson: 'Mark Stevens', email: 'sales@indpower.com', phone: '+1 555-0900', rating: 4.8, status: 'Active' },
    { id: 'sup-02', supplierCode: 'SUP-002', companyName: 'Heavy Machinery Global', contactPerson: 'Angela Rossi', email: 'info@heavymachinery.com', phone: '+1 555-0922', rating: 4.9, status: 'Active' }
  ]
};

module.exports = mockData;
