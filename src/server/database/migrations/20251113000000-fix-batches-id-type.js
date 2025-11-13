"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Drop Sessions table first (has foreign key to Batches)
    await queryInterface.dropTable("Sessions");

    // Drop the existing Batches table
    await queryInterface.dropTable("Batches");

    // Recreate the Batches table with correct schema (STRING id)
    await queryInterface.createTable("Batches", {
      id: {
        type: Sequelize.STRING,
        primaryKey: true,
        allowNull: false,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
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
      totalCount: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      isActive: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
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

    // Add indexes
    await queryInterface.addIndex("Batches", ["userId"], {
      name: "batches_user_id_index",
    });

    await queryInterface.addIndex("Batches", ["isActive"], {
      name: "batches_is_active_index",
    });

    console.log("✓ Batches table recreated with STRING id type");

    // Recreate Sessions table with correct foreign key
    await queryInterface.createTable("Sessions", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      batchId: {
        type: Sequelize.STRING,
        allowNull: false,
        references: {
          model: "Batches",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
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
      sessionDate: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      location: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      count: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true,
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

    // Add indexes for Sessions
    await queryInterface.addIndex("Sessions", ["batchId"], {
      name: "sessions_batch_id_index",
    });

    await queryInterface.addIndex("Sessions", ["userId"], {
      name: "sessions_user_id_index",
    });

    await queryInterface.addIndex("Sessions", ["sessionDate"], {
      name: "sessions_session_date_index",
    });

    console.log("✓ Sessions table recreated with correct foreign key");
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("Batches");
  },
};
