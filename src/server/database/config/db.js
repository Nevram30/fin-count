const dotenv = require("dotenv");
dotenv.config();

const app = new Proxy(process.env, {
  get: (target, prop) => {
    if (!(prop in target)) {
      throw new Error(`Environment variable ${prop} is missing`);
    }

    return target[prop];
  },
});

const config = {
  production: {
    username: app.MYSQLUSER,
    password: app.MYSQLPASSWORD,
    database: app.MYSQLDATABASE,
    host: app.MYSQLHOST,
    dialect: "mysql",
    dialectModule: require("mysql2"),
    logging: false,
    dialectOptions: {
      decimalNumbers: true,
    },
  },
  get development() {
    return {
      ...this.production,
      logging: console.log,
    };
  },
  get test() {
    return {
      ...this.development,
      database: `${app.MYSQLDATABASE}-test`,
      logging: false,
    };
  },
};

module.exports = config; // required for sequelize-cli
