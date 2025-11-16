"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Drop the foreign key constraint
    await queryInterface.removeConstraint(
      "Distributions",
      "Distributions_ibfk_1"
    );
  },

  down: async (queryInterface, Sequelize) => {
    // Re-add the foreign key constraint if needed to rollback
    await queryInterface.addConstraint("Distributions", {
      fields: ["userId"],
      type: "foreign key",
      name: "Distributions_ibfk_1",
      references: {
        table: "Users",
        field: "id",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    });
  },
};
