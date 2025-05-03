document.addEventListener('DOMContentLoaded', function() {
    // Modal elements
    const createAdminModal = document.getElementById('createAdminModal');
    const addAdminBtn = document.getElementById('addAdminBtn');
    const cancelAdminBtn = document.getElementById('cancelAdminBtn');
    const closeModal = document.querySelector('.close-modal');
    
    // Show modal
    if (addAdminBtn) {
        addAdminBtn.addEventListener('click', function() {
            createAdminModal.style.display = 'block';
        });
    }
    
    // Hide modal with cancel button
    if (cancelAdminBtn) {
        cancelAdminBtn.addEventListener('click', function() {
            createAdminModal.style.display = 'none';
        });
    }
    
    // Hide modal with X button
    if (closeModal) {
        closeModal.addEventListener('click', function() {
            createAdminModal.style.display = 'none';
        });
    }
    
    // Hide modal when clicking outside
    window.addEventListener('click', function(event) {
        if (event.target === createAdminModal) {
            createAdminModal.style.display = 'none';
        }
    });
    
    // Handle Create Admin Form
    const createAdminForm = document.getElementById('createAdminForm');
    if (createAdminForm) {
        createAdminForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const name = document.getElementById('adminName').value;
            const email = document.getElementById('adminEmail').value;
            const password = document.getElementById('adminPassword').value;
            
            fetch('/admin/api/create-admin', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'X-Requested-With': 'XMLHttpRequest'
                },
                body: `name=${encodeURIComponent(name)}&email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`
            })
            .then(response => {
                if (response.ok) {
                    return response.json();
                } else if (response.status === 401) {
                    window.location.href = '/login';
                    throw new Error('Not authenticated');
                } else {
                    throw new Error('Request failed');
                }
            })
            .then(data => {
                if (data.success) {
                    createAdminModal.style.display = 'none';
                    createAdminForm.reset();
                    showNotification(data.message, 'success');
                    setTimeout(() => {
                        window.location.reload();
                    }, 1000);
                } else {
                    showNotification(data.message, 'error');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                if (error.message !== 'Not authenticated') {
                    showNotification('An error occurred. Please try again.', 'error');
                }
            });
        });
    }
    
    // Handle Delete User buttons
    const deleteButtons = document.querySelectorAll('.delete-user');
    deleteButtons.forEach(button => {
        button.addEventListener('click', function() {
            const userId = this.getAttribute('data-id');
            if (confirm('Are you sure you want to delete this user?')) {
                deleteUser(userId);
            }
        });
    });
    
    function deleteUser(userId) {
        fetch(`/admin/api/delete-user/${userId}`, {
            method: 'POST',
            headers: {
                'X-Requested-With': 'XMLHttpRequest'
            }
        })
        .then(response => {
            if (response.ok) {
                return response.json();
            } else if (response.status === 401) {
                window.location.href = '/login';
                throw new Error('Not authenticated');
            } else {
                throw new Error('Request failed');
            }
        })
        .then(data => {
            if (data.success) {
                showNotification(data.message, 'success');
                setTimeout(() => {
                    window.location.reload();
                }, 1000);
            } else {
                showNotification(data.message, 'error');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            if (error.message !== 'Not authenticated') {
                showNotification('An error occurred. Please try again.', 'error');
            }
        });
    }
    
    // Helper function to show notification
    function showNotification(message, type) {
        let notification = document.getElementById('notification');
        
        if (!notification) {
            notification = document.createElement('div');
            notification.id = 'notification';
            notification.style.position = 'fixed';
            notification.style.top = '20px';
            notification.style.right = '20px';
            notification.style.padding = '1rem';
            notification.style.borderRadius = '4px';
            notification.style.zIndex = '9999';
            notification.style.maxWidth = '300px';
            notification.style.boxShadow = '0 3px 10px rgba(0, 0, 0, 0.2)';
            notification.style.transition = 'opacity 0.3s ease-in-out';
            document.body.appendChild(notification);
        }
        
        if (type === 'success') {
            notification.style.backgroundColor = '#d4edda';
            notification.style.color = '#155724';
            notification.style.borderLeft = '4px solid #28a745';
        } else if (type === 'error') {
            notification.style.backgroundColor = '#f8d7da';
            notification.style.color = '#721c24';
            notification.style.borderLeft = '4px solid #dc3545';
        }
        
        notification.textContent = message;
        notification.style.opacity = '1';
        
        setTimeout(() => {
            notification.style.opacity = '0';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }
});