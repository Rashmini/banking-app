import { API_BASE_URL } from './config.js';

document.addEventListener('DOMContentLoaded', () => {
    // Authentication form handling
    const authForm = document.getElementById('formAuthentication');
    if (authForm) {
        const errorMessage = document.getElementById('error-message');

        authForm.addEventListener('submit', (event) => {
            event.preventDefault();

            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;

            if (password === "" || username === "") {
                return;
            }

            // Encode the username and password in Base64
            const credentials = btoa(`${username}:${password}`);

            // Make an AJAX request to the /authenticate API
            fetch(`${API_BASE_URL}/authenticate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Basic ${credentials}`
                }
            })
                .then(response => {
                    if (response.ok) {
                        // Store the username in local storage
                        localStorage.setItem('username', username);

                        window.location.href = 'pages/profile.html';
                    } else {
                        // Display error message
                        errorMessage.style.display = 'block';
                    }
                })
                .catch(error => {
                    showAlert('Error in authenticating user.', 'danger');
                });
        });
    }

    // Profile page handling
    const profilePage = document.getElementById('profile-page');
    if (profilePage) {
        const username = localStorage.getItem('username');

        if (!username) {
            window.location.href = 'index.html'; // Redirect to login if username is not found
            return;
        }

        document.getElementById('username').textContent = username;

        // Fetch user profile information
        fetch(`${API_BASE_URL}/customers/${username}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        })
            .then(response => response.json())
            .then(data => {
                const welcomeMessage = document.getElementById('welcome-message');
                welcomeMessage.textContent = `Welcome, ${data.firstName} ${data.lastName}!`;
            })
            .catch(error => {
                showAlert('Error in fetching user information.', 'danger');
            });
    }

    // Accounts page handling
    const accountsPage = document.getElementById('accounts-page');
    if (accountsPage) {
        const username = localStorage.getItem('username');

        if (!username) {
            window.location.href = 'index.html'; // Redirect to login if username is not found
            return;
        }

        document.getElementById('username').textContent = username;

        // Fetch account information
        fetch(`${API_BASE_URL}/accounts?customerNumber=${username}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        })
            .then(response => response.json())
            .then(data => {
                const accountsInfo = document.getElementById('accounts-info');

                if (Array.isArray(data)) {
                    accountsInfo.innerHTML = ''; // Clear existing content
                    data.forEach(account => {
                        const card = document.createElement('div');
                        card.className = 'col-lg-4 col-md-6 col-sm-12 mb-4';
                        card.innerHTML = `
                            <div class="card" data-account-number="${account.accountNumber}">
                                <div class="card-body">
                                    <h5 class="card-title">Account Number: ${account.accountNumber}</h5>
                                    <p class="card-text">Account Type: ${account.accountType}</p>
                                    <p class="card-text">Balance (NZD): ${account.currentBalance}</p>
                                </div>
                            </div>
                        `;
                        accountsInfo.appendChild(card);
                    });

                    // Add event listeners to account cards
                    document.querySelectorAll('.card').forEach(card => {
                        card.addEventListener('click', () => {
                            document.querySelectorAll('.card').forEach(card => card.classList.remove('selected'));
                            card.classList.add('selected');
                            const accountNumber = card.getAttribute('data-account-number');
                            showAccountTransactions(accountNumber);
                        });
                    });
                } else {
                    accountsInfo.innerHTML = '<p>No accounts found.</p>';
                }
            })
            .catch(error => {
                showAlert('Error in fetching accounts.', 'danger');
            });
    }

    // Fetch transactions
    function showAccountTransactions(accountNumber) {
        fetch(`${API_BASE_URL}/accounts/${accountNumber}/transactions`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        })
            .then(response => response.json())
            .then(transactions => {
                const transactionsDiv = document.getElementById('transactions');
                transactionsDiv.innerHTML = `
                    <h2>Transactions</h2>
                    <table class="table">
                        <thead>
                            <tr>
                                <th scope="col"></th>
                                <th scope="col">From Account</th>
                                <th scope="col">To Account</th>
                                <th scope="col">Date</th>
                                <th scope="col">Amount (NZD)</th>
                            </tr>
                        </thead>
                        <tbody id="transactions-body">
                        </tbody>
                    </table>
                `;

                const transactionsBody = document.getElementById('transactions-body');

                if (Array.isArray(transactions) && transactions.length > 0) {
                    transactions.forEach(transaction => {
                        const row = document.createElement('tr');
                        let indicator = '';
                        let fromAccount = transaction.fromAccount;
                        let toAccount = transaction.toAccount;

                        if (transaction.fromAccount === accountNumber) {
                            fromAccount = '-';
                            indicator = '<i class="bi bi-arrow-left-circle-fill text-danger"></i>';
                        }

                        if (transaction.toAccount === accountNumber) {
                            toAccount = '-';
                            indicator = '<i class="bi bi-arrow-right-circle-fill text-success"></i>'
                        }

                        row.innerHTML = `
                            <td>${indicator}</td>
                            <td>${fromAccount}</td>
                            <td>${toAccount}</td>
                            <td>${transaction.dateTime}</td>
                            <td>${transaction.amount}</td>
                        `;
                        transactionsBody.appendChild(row);
                    });
                } else {
                    transactionsBody.innerHTML = '<tr><td colspan="5">No transactions found.</td></tr>';
                }
            })
            .catch(error => {
                showAlert('Error in fetching transacions.', 'danger');
            });
    }

    // Show alerts
    function showAlert(message, type) {
        const alertContainer = document.getElementById('alert-container');
        if (!alertContainer) return;

        // Clear any existing alerts
        alertContainer.innerHTML = '';

        const alert = document.createElement('div');
        alert.className = `alert alert-${type} alert-dismissible fade show`;
        alert.role = 'alert';
        alert.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        `;
        alertContainer.appendChild(alert);

        // Automatically remove the alert after 5 seconds
        setTimeout(() => {
            alert.classList.remove('show');
            alert.classList.add('fade');
            setTimeout(() => alert.remove(), 150);
        }, 5000);
    }
});
