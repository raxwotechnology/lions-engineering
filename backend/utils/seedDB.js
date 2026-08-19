const Category = require('../models/Category');
const Tool = require('../models/Tool');
const Customer = require('../models/Customer');
const User = require('../models/User');
const Reservation = require('../models/Reservation');
const Transaction = require('../models/Transaction');
const Expense = require('../models/Expense');
const Supplier = require('../models/Supplier');
const Quotation = require('../models/Quotation');
const mockData = require('./mockData');

const seedDB = async () => {
  try {
    const categoryCount = await Category.countDocuments();
    if (categoryCount > 0) {
      console.log('ℹ️  Database already populated. Skipping automatic seeding.');
      return;
    }

    console.log('🌱 Seeding initial records to MongoDB Atlas...');

    // 1. Seed Categories
    const categoriesMap = {};
    for (const cat of mockData.categories) {
      const createdCat = await Category.create({
        name: cat.name,
        code: cat.code,
        description: cat.description,
        icon: cat.icon,
        status: cat.status
      });
      categoriesMap[cat.name] = createdCat._id;
      categoriesMap[cat.id] = createdCat._id;
    }
    console.log('  └─ Categories seeded');

    // 2. Seed Suppliers
    const suppliersMap = {};
    for (const sup of mockData.suppliers) {
      const createdSup = await Supplier.create({
        supplierCode: sup.supplierCode,
        companyName: sup.companyName,
        contactPerson: sup.contactPerson,
        email: sup.email,
        phone: sup.phone,
        rating: sup.rating,
        status: sup.status
      });
      suppliersMap[sup.id] = createdSup._id;
    }
    console.log('  └─ Suppliers seeded');

    // 3. Seed Tools
    const toolsMap = {};
    for (const t of mockData.tools) {
      const categoryId = categoriesMap[t.category] || Object.values(categoriesMap)[0];
      const createdTool = await Tool.create({
        toolCode: t.toolCode,
        name: t.name,
        category: categoryId,
        brand: t.brand,
        modelNumber: t.modelNumber,
        serialNumber: t.serialNumber,
        dailyRate: t.dailyRate,
        depositAmount: t.depositAmount,
        status: t.status,
        condition: t.condition,
        description: t.description
      });
      toolsMap[t.name] = createdTool._id;
      toolsMap[t.id] = createdTool._id;
    }
    console.log('  └─ Tools seeded');

    // 4. Seed Customers
    const customersMap = {};
    for (const c of mockData.customers) {
      const createdCust = await Customer.create({
        customerCode: c.customerCode,
        fullName: c.fullName,
        email: c.email,
        phone: c.phone,
        companyName: c.companyName,
        idProofType: c.idProofType,
        idProofNumber: c.idProofNumber,
        status: c.status,
        notes: c.notes
      });
      customersMap[c.fullName] = createdCust._id;
      customersMap[c.id] = createdCust._id;
    }
    console.log('  └─ Customers seeded');

    // 5. Seed Users
    for (const u of mockData.users) {
      await User.create({
        name: u.name,
        email: u.email,
        password: '$2a$10$YourHashedPasswordHerePlaceholder123456', // dummy hashed password
        role: u.role,
        phone: u.phone,
        status: u.status
      });
    }
    console.log('  └─ Users seeded');

    // 6. Seed Expenses
    for (const exp of mockData.expenses) {
      await Expense.create({
        title: exp.title,
        category: exp.category,
        amount: exp.amount,
        expenseDate: new Date(exp.expenseDate),
        vendor: exp.vendor,
        status: exp.status
      });
    }
    console.log('  └─ Expenses seeded');

    // 7. Seed Reservations
    const reservationsMap = {};
    for (const res of mockData.reservations) {
      const customerId = customersMap[res.customerName] || Object.values(customersMap)[0];
      const toolId = toolsMap[res.toolName] || Object.values(toolsMap)[0];
      if (customerId && toolId) {
        const createdRes = await Reservation.create({
          reservationCode: res.reservationCode,
          customer: customerId,
          tool: toolId,
          startDate: new Date(res.startDate),
          endDate: new Date(res.endDate),
          totalDays: res.totalDays,
          totalEstimatedCost: res.totalEstimatedCost,
          status: res.status
        });
        reservationsMap[res.id] = createdRes._id;
      }
    }
    console.log('  └─ Reservations seeded');

    // 8. Seed Transactions
    for (const tx of mockData.transactions) {
      const customerId = customersMap[tx.customerName] || Object.values(customersMap)[0];
      const toolId = toolsMap[tx.toolName] || Object.values(toolsMap)[0];
      if (customerId && toolId) {
        await Transaction.create({
          transactionCode: tx.transactionCode,
          customer: customerId,
          tool: toolId,
          transactionType: tx.transactionType,
          issueDate: new Date(tx.issueDate),
          expectedReturnDate: new Date(tx.expectedReturnDate),
          actualReturnDate: tx.actualReturnDate ? new Date(tx.actualReturnDate) : null,
          dailyRate: tx.dailyRate,
          rentAmount: tx.totalAmount - (tx.lateFee || 0),
          depositPaid: tx.depositPaid,
          lateFee: tx.lateFee || 0,
          totalAmount: tx.totalAmount,
          paymentStatus: tx.paymentStatus,
          paymentMethod: tx.paymentMethod
        });
      }
    }
    console.log('  └─ Transactions seeded');

    // 9. Seed Quotations
    for (const q of mockData.quotations) {
      const customerId = Object.values(customersMap)[0];
      await Quotation.create({
        quotationNumber: q.quotationNumber,
        customer: customerId,
        customerName: q.customerName,
        subtotal: q.totalAmount,
        totalAmount: q.totalAmount,
        validUntil: new Date(q.validUntil),
        status: q.status
      });
    }
    console.log('  └─ Quotations seeded');

    console.log('🎉 MongoDB Atlas Seeding Completed Successfully!');
  } catch (error) {
    console.error(`⚠️ Database Seeding Warning: ${error.message}`);
  }
};

module.exports = seedDB;
