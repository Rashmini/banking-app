import { API_BASE_URL } from './config.js';

document.addEventListener('DOMContentLoaded', () => {
    const username = localStorage.getItem('username');

    if (!username) {
        window.location.href = 'index.html'; // Redirect to login if username is not found
        return;
    }

    document.getElementById('username').textContent = username;

    // Fetch accounts for dropdowns
    fetch(`${API_BASE_URL}/accounts?customerNumber=${username}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        }
    })
        .then(response => response.json())
        .then(data => {
            populateAccountDropdowns(data);
        })
        .catch(error => {
            showAlert('Error in fetching accounts.', 'danger');
        });

    // Add available accounts to dropdowns
    function populateAccountDropdowns(accounts) {
        const fromAccountOwn = document.getElementById('from-account-own');
        const toAccountOwn = document.getElementById('to-account-own');
        const fromAccountOther = document.getElementById('from-account-other');

        accounts.forEach(account => {
            const optionFrom = document.createElement('option');
            optionFrom.value = account.accountNumber;
            optionFrom.textContent = account.accountNumber;
            fromAccountOwn.appendChild(optionFrom);

            const optionTo = document.createElement('option');
            optionTo.value = account.accountNumber;
            optionTo.textContent = account.accountNumber;
            toAccountOwn.appendChild(optionTo);

            const optionFromOther = document.createElement('option');
            optionFromOther.value = account.accountNumber;
            optionFromOther.textContent = account.accountNumber;
            fromAccountOther.appendChild(optionFromOther);
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

    // Clear forms
    function clearForm(form) {
        form.reset();
        form.classList.remove('was-validated');
    }

    // Handle own account transfer form
    document.getElementById('own-account-form').addEventListener('submit', (event) => {
        event.preventDefault();
        const form = event.target;
        const fromAccount = document.getElementById('from-account-own').value;
        const toAccount = document.getElementById('to-account-own').value;
        const amount = parseFloat(document.getElementById('amount-own').value);

        if (fromAccount && toAccount && !isNaN(amount)) {
            submitTransaction({ fromAccount, toAccount, amount }, form);
        } else {
            form.classList.add('was-validated');
        }
    });

    // Handle other account transfer form
    document.getElementById('other-account-form').addEventListener('submit', (event) => {
        event.preventDefault();
        const form = event.target;
        const fromAccount = document.getElementById('from-account-other').value;
        const toAccount = document.getElementById('to-account-other').value;
        const amount = parseFloat(document.getElementById('amount-other').value);

        if (fromAccount && toAccount && !isNaN(amount)) {
            submitTransaction({ fromAccount, toAccount, amount }, form);
        } else {
            form.classList.add('was-validated');
        }
    });

    // Handle transaction submit
    function submitTransaction(transaction, form) {
        const now = new Date().toISOString();

        fetch(`${API_BASE_URL}/transactions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                ...transaction,
                dateTime: now
            })
        })
            .then(response => {
                if (response.ok) {
                    showAlert('Transaction successful!', 'success');
                } else {
                    showAlert('Transaction failed.', 'danger');
                }
                clearForm(form);
            })
            .catch(error => {
                showAlert('An error occurred while submitting the transaction.', 'danger');
                clearForm(form);
            });
    }
});
