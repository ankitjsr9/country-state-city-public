const express = require("express");
const mysql = require("mysql");
const path = require("path");

const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "qmpz#1029",
  database: "new_schema",
});

const countryValidate = (data) => {
  let errors = {};
  if (data == null || data == "") errors.countryId = "Country Id is required.";
  const isValid = Object.keys(errors).length === 0;
  return { errors, isValid };
};
connection.connect();
const getCountryList = (request, response) => {
  connection.query(
    "SELECT country_name AS countryName, country_id AS countryId, iso3, iso2, phone_code AS phoneCode, capital, currency, currency_symbol AS currencySymbol, region, subregion, latitude, longitude, emojiU FROM address_country ORDER BY country_name ASC",
    function (error, results, fields) {
      if (error) {
        return response.status(400).json({
          status: false,
          error: "Something went wrong. Please try again later.",
          data: [],
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

app.use(express.static(path.join(__dirname, "static")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "/views/index.html"));
});
app.get("/api/v1/", getCountryList);
app.get("/api/v1/:countryId", getStateList);
app.get("/api/v1/:countryId/:stateId", getCityList);

app.listen(port, () => {
  console.log("Running");
});