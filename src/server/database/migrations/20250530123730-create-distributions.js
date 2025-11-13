"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Distributions", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      dateDistributed: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      beneficiaryName: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      area: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      barangay: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      municipality: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      province: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      fingerlings: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      species: {
        type: Sequelize.ENUM("Tilapia", "Bangus"),
        allowNull: false,
      },
      survivalRate: {
        type: Sequelize.DECIMAL(5, 4),
        allowNull: false,
        comment: "Survival rate as decimal (e.g., 0.78 for 78%)",
      },
      avgWeight: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        comment: "Average weight in kilograms",
      },
      harvestKilo: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        comment: "Total harvest in kilograms",
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "Users",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });

    // Add indexes for better query performance
    await queryInterface.addIndex("Distributions", ["userId"], {
      name: "distributions_user_id_index",
    });

    await queryInterface.addIndex("Distributions", ["species"], {
      name: "distributions_species_index",
    });

    await queryInterface.addIndex("Distributions", ["dateDistributed"], {
      name: "distributions_date_distributed_index",
    });

    await queryInterface.addIndex("Distributions", ["municipality"], {
      name: "distributions_municipality_index",
    });

    await queryInterface.addIndex("Distributions", ["province"], {
      name: "distributions_province_index",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("Distributions");
  },
};
