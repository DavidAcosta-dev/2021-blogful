"use strict";

exports.DATABASE_URL = process.env.DATABASE_URL || "mongodb://localhost/Blogful-local-2021";

exports.TEST_DATABASE_URL = process.env.TEST_DATABASE_URL || "mongodb://localhost/Test-Blogful-local-2021";

exports.PORT = process.env.PORT || 8080;