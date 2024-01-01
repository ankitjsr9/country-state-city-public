const express = require("express");
const mysql = require("mysql");
const path = require("path");
const fs = require("fs");
const hbs = require("hbs");
const cors = require("cors");

var whitelist = ["https://country-state-city-three.vercel.app"];
var corsOptions = {
  origin: function (origin, callback) {
    if (whitelist.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(
        new Error("Please contact ankitprojectsdev@gmail.com access this API."),
        false
      );
    }
  },
};

var databaseConnectionSuccess = false;

const connection = mysql.createConnection({
  host: "",
  user: "",
  password: "",
  database: "",
  port: 1234,
});
try {
  try {
    connection.connect();
    databaseConnectionSuccess = true;
  } catch (errorInside) {
    console.log(errorInside);
  }
} catch (error) {
  console.log(error);
}

const countryValidate = (data) => {
  let errors = {};
  if (data == null || data == "") errors.countryId = "Country Id is required.";
  const isValid = Object.keys(errors).length === 0;
  return { errors, isValid };
};

const getCountryList = (request, response) => {
  if (!databaseConnectionSuccess) {
    return response.status(400).json({
      status: false,
      error:
        "Failed to Make database connection. Please try again later or contact ankitjsr9@gmail.com.",
      data: [],
    });
  }
  connection.query(
    "SELECT country_name AS countryName, country_id AS countryId, iso3, iso2, phone_code AS phoneCode, capital, currency, currency_symbol AS currencySymbol, region, subregion, latitude, longitude, emojiU FROM address_country ORDER BY country_name ASC",
    function (error, results, fields) {
      if (error) {
        return response.status(400).json({
          status: false,
          error: "Something went wrong. Please try again later.",
          data: [],
          a: error,
          b: results,
        });
      } else {
        return response.status(200).json({
          status: true,
          data: results,
          error: "",
        });
      }
    }
  );
};
const validateGetStateList = (data) => {
  if (data.params.countryId == null || data.params.countryId == "")
    return { error: "Country Id is required", isValid: false, countryId: -1 };
  return {
    error: "",
    isValid: true,
    countryId: parseInt(data.params.countryId),
  };
};

const validateGetCityList = (data) => {
  if (data.params.countryId == null || data.params.countryId == "")
    return {
      error: "Country Id is required",
      isValid: false,
      countryId: -1,
      stateId: -1,
    };
  if (data.params.stateId == null || data.params.stateId == "")
    return {
      error: "State Id is required",
      isValid: false,
      countryId: -1,
      stateId: -1,
    };
  return {
    error: "",
    isValid: true,
    countryId: parseInt(data.params.countryId),
    stateId: parseInt(data.params.stateId),
  };
};

const getStateList = (request, response) => {
  const responsevalidateGetStateList = validateGetStateList(request);
  if (responsevalidateGetStateList.isValid) {
    if (!databaseConnectionSuccess) {
      return response.status(400).json({
        status: false,
        error:
          "Failed to Make database connection. Please try again later or contact ankitjsr9@gmail.com.",
        data: [],
      });
    }
    let countryId = responsevalidateGetStateList.countryId;
    connection.query(
      "SELECT state_name AS stateName, state_id AS stateId, state_code AS stateCode, country_id AS countryId, state_latitude AS lattitude, state_longitude AS longitude FROM address_state WHERE country_id = '" +
        countryId +
        "' ORDER BY state_name ASC",
      function (error, results, fields) {
        if (error) {
          return response.status(400).json({
            status: false,
            error: "Something went wrong. Please try again later.",
            data: [],
          });
        } else {
          if (results.length == 0) {
            return response.status(200).json({
              status: false,
              data: {},
              error: "CountryId is invalid.",
            });
          }
          return response.status(200).json({
            status: true,
            data: results,
            error: "",
          });
        }
      }
    );
  } else {
    return response.status(200).json({
      status: false,
      data: {},
      error: responsevalidateGetStateList.error,
    });
  }
};

const getCityList = (request, response) => {
  const responsevalidateGetCityList = validateGetCityList(request);
  if (responsevalidateGetCityList.isValid) {
    if (!databaseConnectionSuccess) {
      return response.status(400).json({
        status: false,
        error:
          "Failed to Make database connection. Please try again later or contact ankitjsr9@gmail.com.",
        data: [],
      });
    }
    let countryId = responsevalidateGetCityList.countryId;
    let stateId = responsevalidateGetCityList.stateId;
    connection.query(
      "SELECT city_name AS cityName, city_id AS cityId, state_id AS stateId, country_id AS countryId, city_latitude AS lattitude, city_longitude AS longitude, city_wikiDataId AS wikiDataId, continent FROM address_city WHERE country_id = '" +
        countryId +
        "' AND state_id = '" +
        stateId +
        "' ORDER BY city_name ASC",
      function (error, results, fields) {
        if (error) {
          return response.status(400).json({
            status: false,
            error: "Something went wrong. Please try again later.",
            data: [],
          });
        } else {
          if (results.length == 0) {
            return response.status(200).json({
              status: false,
              data: {},
              error: "Country Id or State Id is invalid.",
            });
          }
          return response.status(200).json({
            status: true,
            data: results,
            error: "",
          });
        }
      }
    );
  } else {
    return response.status(200).json({
      status: false,
      data: {},
      error: responsevalidateGetCityList.error,
    });
  }
};

const app = express();
const port = 3000;
app.set("view engine", "hbs");

app.use(express.static(path.join(__dirname, "static")));
app.use(express.static(path.join(__dirname, "public")));

app.set("views", "public");

app.post("/api/v1/:countryId/:stateId", cors(corsOptions), getCityList);

app.post("/api/v1/:countryId", cors(corsOptions), getStateList);

app.post("/api/v1/", cors(corsOptions), getCountryList);

app.get("/", (req, res) => {
  res.render("views/index.hbs", {
    hostServer:
      req.protocol +
      (req.headers.host == "localhost:3000" ? "" : "s") +
      "://" +
      req.headers.host +
      "/api/v1/",
  });
});

app.listen(port, () => {
  console.log("Running");
});
module.exports = app;
