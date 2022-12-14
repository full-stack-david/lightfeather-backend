const express = require('express');
const https = require('https');
const cors = require('cors');
const app = express();
const port = 4000;

app.use(cors());
app.use(
  express.urlencoded({
    extended: true,
  })
);

app.get('/api/supervisors', (req, res) => {
  const url = 'https://o3m5qixdng.execute-api.us-east-1.amazonaws.com/api/managers';

  https.get(url, response => {
    let body = [];

    response.on('data', chunk => {
      body.push(chunk);
    });

    response.on('end', () => {
      let parsedData = JSON.parse(Buffer.concat(body).toString());

      // Remove numeric jurisdictions from response
      let filtered = [];
      parsedData.forEach(item => {
        if (isNaN(item.jurisdiction)) {
          filtered.push(item);
        }
      });

      // Sort by jurisdiction, last name, and first name in alphabetical order
      filtered.sort((a, b) => {
        if (a.lastName.toUpperCase() === b.lastName.toUpperCase()) {
          return a.firstName > b.firstName ? 1 : -1;
        }

        if (a.jurisdiction === b.jurisdiction) {
          return a.lastName > b.lastName ? 1 : -1;
        }

        return a.jurisdiction > b.jurisdiction ? 1 : -1;
      });

      // Formatting of the result
      let result = [];
      filtered.forEach(item => {
        result.push({
          id: item.id,
          label: item.formatted = item.jurisdiction + ' - ' + item.lastName + ', ' + item.firstName
        });
      });

      res.send(result);
    });
  });
});

app.post('/api/submit', (req, res) => {
  let valid = true;
  let errors = {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    supervisor: ''
  };
  let body = [];

  req.on('data', chunk => {
    body.push(chunk);
  });

  req.on('end', () => {
    let parsedData = JSON.parse(Buffer.concat(body).toString());

    if (parsedData.firstName === '') {
      errors.firstName = 'First Name is required!';
      valid = false;
    }

    if (parsedData.lastName === '') {
      errors.lastName = 'Last Name is required!';
      valid = false;
    }

    if (parsedData.supervisor === '') {
      errors.supervisor = 'Supervisor is required!';
      valid = false;
    }

    if (valid) {
      res.send({status: 200});
    } else {
      res.send({status: 400, errors});
    }
  });
});

app.listen(port, () => {
  
});