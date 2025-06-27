const express = require('express')
const app = express()
const port = 1234

// Enable parsing of URL-encoded data
app.use(express.urlencoded({ extended: true }))

const exchangeRateEURtoUSD = 1.16
const exchangeRateUSDtoGBP = 0.73

app.get('/', (req, res) => {
  res.send(`
    <html>
      <head>
        <title>Convertisseur de devises</title>
        <style>
          body { font-family: sans-serif; text-align: center; margin-top: 50px; }
          button { margin: 10px; padding: 10px 20px; font-size: 16px; }
          .converter { margin-bottom: 30px; }
        </style>
      </head>
      <body>
        <div class="converter">
          <h1>Convertisseur EUR → USD</h1>
          <input type="number" id="eurAmount" value="100" step="0.01" min="0" style="padding: 10px; width: 100px; margin-right: 10px;">
          <button onclick="convertEURtoUSD(document.getElementById('eurAmount').value)">Convertir €</button>
          <p id="resultEUR"></p>
        </div>
        
        <div class="converter">
          <h1>Convertisseur USD → GBP</h1>
          <input type="number" id="usdAmount" value="100" step="0.01" min="0" style="padding: 10px; width: 100px; margin-right: 10px;">
          <button onclick="convertUSDtoGBP(document.getElementById('usdAmount').value)">Convertir $</button>
          <p id="resultUSD"></p>
        </div>
        
        <script>
          // Initialize both converters when the page loads
          window.onload = function() {
            // Pre-fill with initial conversions
            convertEURtoUSD(document.getElementById('eurAmount').value);
            convertUSDtoGBP(document.getElementById('usdAmount').value);
          };
          
          function convertEURtoUSD(eur) {
            // Validate input: ensure it's a positive number
            const eurValue = parseFloat(eur);
            if (isNaN(eurValue) || eurValue < 0) {
              document.getElementById('resultEUR').innerText = 'Erreur : Veuillez entrer un montant positif';
              return;
            }
            
            fetch('/convert-eur-to-usd?eur=' + eurValue)
              .then(response => response.text())
              .then(result => {
                document.getElementById('resultEUR').innerText = result;
              })
              .catch(error => {
                document.getElementById('resultEUR').innerText = 'Erreur : ' + error;
                console.error('EUR to USD error:', error);
              });
          }
          
          function convertUSDtoGBP(usd) {
            // Validate input: ensure it's a positive number
            const usdValue = parseFloat(usd);
            if (isNaN(usdValue) || usdValue < 0) {
              document.getElementById('resultUSD').innerText = 'Erreur : Veuillez entrer un montant positif';
              return;
            }
            
            fetch('/convert-usd-to-gbp?usd=' + usdValue)
              .then(response => response.text())
              .then(result => {
                document.getElementById('resultUSD').innerText = result;
              })
              .catch(error => {
                document.getElementById('resultUSD').innerText = 'Erreur : ' + error;
                console.error('USD to GBP error:', error);
              });
          }
        </script>
      </body>
    </html>
  `)
})

app.get('/convert-eur-to-usd', (req, res) => {
  const euros = parseFloat(req.query.eur)

  if (isNaN(euros) || euros < 0) {
    return res.status(400).send('Montant invalide sale con met un nombre positif')
  }

  const dollars = euros * exchangeRateEURtoUSD
  res.send(`${euros} EUR = ${dollars.toFixed(2)} USD`)
})

app.get('/convert-usd-to-gbp', (req, res) => {
    const dollars = parseFloat(req.query.usd)

    if (isNaN(dollars) || dollars < 0) {
        return res.status(400).send('Montant invalide: doit être un nombre positif')
    }

    const pounds = dollars * exchangeRateUSDtoGBP
    res.send(`${dollars} USD = ${pounds.toFixed(2)} GBP`)
})

// Only start the server if this file is run directly
if (require.main === module) {
  // Écouter sur toutes les interfaces réseau (0.0.0.0) au lieu de localhost uniquement
  app.listen(port, '0.0.0.0', () => {
    console.log(`App listening on port ${port}`)
    console.log(`Local access: http://localhost:${port}`)
    
    // Afficher l'adresse IP locale pour faciliter l'accès depuis d'autres machines
    const { networkInterfaces } = require('os');
    const nets = networkInterfaces();
    const results = {};
    
    for (const name of Object.keys(nets)) {
      for (const net of nets[name]) {
        // Ignorer les interfaces non IPv4 et les interfaces internes
        if (net.family === 'IPv4' && !net.internal) {
          if (!results[name]) {
            results[name] = [];
          }
          results[name].push(net.address);
        }
      }
    }
    
    // Afficher les adresses IP disponibles
    console.log('\nAccess from other devices using one of these URLs:')
    for (const name of Object.keys(results)) {
      for (const ip of results[name]) {
        console.log(`http://${ip}:${port}`);
      }
    }
  })
}

// Export the app for testing
module.exports = { app, exchangeRateEURtoUSD, exchangeRateUSDtoGBP }
