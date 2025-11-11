"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Sessions", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      batchId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "Batches",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      species: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      location: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      counts: {
        type: Sequelize.JSON,
        allowNull: false,
        defaultValue: {},
      },
      timestamp: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      imageUrl: {
        type: Sequelize.STRING,
        allowNull: false,
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

    // Add index on batchId for better query performance
    await queryInterface.addIndex("Sessions", ["batchId"], {
      name: "sessions_batch_id_index",
    });

    // Add index on timestamp for sorting and filtering
    await queryInterface.addIndex("Sessions", ["timestamp"], {
      name: "sessions_timestamp_index",
    });

    // Add index on species for filtering by species
    await queryInterface.addIndex("Sessions", ["species"], {
      name: "sessions_species_index",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("Sessions");
  },
};
