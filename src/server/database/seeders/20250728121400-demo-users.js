"use strict";
const bcrypt = require("bcrypt");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Hash passwords
    const adminPassword = await bcrypt.hash("Admin123!", 10);
    const staffPassword = await bcrypt.hash("Staff123@", 10);

    // Insert users
    const users = await queryInterface.bulkInsert(
      "Users",
      [
        {
          email: "admin@example.com",
          password: adminPassword,
          userType: "admin",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          email: "staff@example.com",
          password: staffPassword,
          userType: "staff",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      {
        returning: true,
      }
    );

    // Get the inserted user IDs
    const adminUser = await queryInterface.sequelize.query(
      "SELECT id FROM Users WHERE email = 'admin@example.com'",
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    const staffUser = await queryInterface.sequelize.query(
      "SELECT id FROM Users WHERE email = 'staff@example.com'",
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    // Insert admin profile
    await queryInterface.bulkInsert("Admins_Profiles", [
      {
        userId: adminUser[0].id,
        firstName: "John",
        lastName: "Administrator",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);

    // Insert staff profile
    await queryInterface.bulkInsert("Staff_Profiles", [
      {
        userId: staffUser[0].id,
        username: "staff_user",
        fullName: "Jane Staff Member",
        phoneNumber: "+1234567890",
        profilePhoto: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    // Remove profiles first (due to foreign key constraints)
    await queryInterface.bulkDelete("Admins_Profiles", {
      userId: {
        [Sequelize.Op.in]: [
          queryInterface.sequelize.literal(
            "(SELECT id FROM Users WHERE email = 'admin@example.com')"
          ),
        ],
      },
    });

    await queryInterface.bulkDelete("Staff_Profiles", {
      userId: {
        [Sequelize.Op.in]: [
          queryInterface.sequelize.literal(
            "(SELECT id FROM Users WHERE email = 'staff@example.com')"
          ),
        ],
      },
    });

    // Remove users
    await queryInterface.bulkDelete("Users", {
      email: {
        [Sequelize.Op.in]: ["admin@example.com", "staff@example.com"],
      },
    });
  },
};
