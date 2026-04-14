
class DebtManager {
    constructor() {
        this.debts = JSON.parse(localStorage.getItem('debts')) || [];
        this.init();
    }

    init() {
        this.renderDebts();
        this.updateSummary();
        this.bindEvents();
    }

    bindEvents() {
        document.getElementById('debtForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addDebt();
        });
    }

    addDebt() {
        const creditor = document.getElementById('creditor').value;
        const amount = parseFloat(document.getElementById('amount').value);
        const dueDate = document.getElementById('dueDate').value;
        const description = document.getElementById('description').value;

        const debt = {
            id: Date.now(),
            creditor,
            amount,
            dueDate,
            description,
            paid: false,
            createdAt: new Date().toISOString()
        };

        this.debts.unshift(debt);
        this.saveDebts();
        this.renderDebts();
        this.updateSummary();
        this.clearForm();
    }

    markAsPaid(id) {
        const debt = this.debts.find(d => d.id === id);
        if (debt) {
            debt.paid = !debt.paid;
            this.saveDebts();
            this.renderDebts();
            this.updateSummary();
        }
    }

    deleteDebt(id) {
        if (confirm('¿Estás seguro de eliminar esta deuda?')) {
            this.debts = this.debts.filter(d => d.id !== id);
            this.saveDebts();
            this.renderDebts();
            this.updateSummary();
        }
    }

    saveDebts() {
        localStorage.setItem('debts', JSON.stringify(this.debts));
    }

    isOverdue(debt) {
        const dueDate = new Date(debt.dueDate);
        return new Date() > dueDate && !debt.paid;
    }

    isDueSoon(debt) {
        const dueDate = new Date(debt.dueDate);
        const now = new Date();
        const diffTime = dueDate - now;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays <= 3 && diffDays > 0 && !debt.paid;
    }

    renderDebts() {
        const container = document.getElementById('debtsList');
        if (this.debts.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: #666; font-style: italic;">No hay deudas registradas 🎉</p>';
            return;
        }

        container.innerHTML = this.debts.map(debt => {
            const isOverdue = this.isOverdue(debt);
            const isDueSoon = this.isDueSoon(debt);
            const className = debt.paid ? 'paid' : (isOverdue ? 'overdue' : (isDueSoon ? 'due-soon' : ''));

            const dueDate = new Date(debt.dueDate).toLocaleDateString('es-ES');
            const createdDate = new Date(debt.createdAt).toLocaleDateString('es-ES');

            return `
                <div class="debt-item ${className}">
                    <div class="debt-info">
                        <h3>${debt.creditor}</h3>
                        <p><strong>Monto:</strong> $${debt.amount.toLocaleString('es-ES', {minimumFractionDigits: 2})}</p>
                        <p><strong>Vence:</strong> ${dueDate} ${isOverdue ? '(VENCIDA)' : isDueSoon ? '(PRONTO)' : ''}</p>
                        ${debt.description ? `<p><strong>Nota:</strong> ${debt.description}</p>` : ''}
                        <p style="font-size: 12px; color: #888;"><em>Creada: ${createdDate}</em></p>
                    </div>
                    <div>
                        <span class="amount">$${debt.amount.toLocaleString()}</span>
                        <button class="btn ${debt.paid ? 'btn-delete' : 'btn-pay'}" onclick="debtManager.markAsPaid(${debt.id})">
                            ${debt.paid ? 'Desmarcar' : 'Pagar'}
                        </button>
                        <button class="btn btn-delete" onclick="debtManager.deleteDebt(${debt.id})">Eliminar</button>
                    </div>
                </div>
            `;
        }).join('');
    }

    updateSummary() {
        const activeDebts = this.debts.filter(d => !d.paid);
        const totalAmount = activeDebts.reduce((sum, debt) => sum + debt.amount, 0);

        document.getElementById('totalAmount').textContent = totalAmount.toLocaleString('es-ES', {minimumFractionDigits: 2});
        document.getElementById('activeDebts').textContent = activeDebts.length;
    }

    clearForm() {
        document.getElementById('debtForm').reset();
        document.getElementById('dueDate').valueAsDate = new Date();
    }
}

// Inicializar la app
const debtManager = new DebtManager();
