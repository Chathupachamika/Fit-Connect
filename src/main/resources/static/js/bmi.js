document.addEventListener('DOMContentLoaded', function() {
    const bmiForm = document.getElementById('bmiForm');
    const bmiResult = document.getElementById('bmiResult');

    if (bmiForm) {
        bmiForm.addEventListener('submit', function(e) {
            e.preventDefault();

            const weight = document.getElementById('weight').value;
            const height = document.getElementById('height').value;
            const gender = document.getElementById('gender').value;

            let url = `/api/calculate-bmi?weight=${weight}&height=${height}`;
            if (gender) {
                url += `&gender=${gender}`;
            }

            fetch(url, {
                method: 'POST',
                headers: {
                    'X-Requested-With': 'XMLHttpRequest'
                }
            })
            .then(response => {
                if (response.ok) {
                    return response.json();
                } else if (response.status === 401) {
                    // Handle unauthorized error (redirect to login)
                    window.location.href = '/login';
                    throw new Error('Not authenticated');
                } else {
                    throw new Error('Request failed');
                }
            })
            .then(data => {
                // Update BMI result
                updateBmiResult(data);

                // Show result
                bmiResult.classList.remove('hidden');

                // Smooth scroll to result
                bmiResult.scrollIntoView({ behavior: 'smooth' });
            })
            .catch(error => {
                console.error('Error:', error);
                if (error.message !== 'Not authenticated') {
                    showNotification('An error occurred. Please try again.', 'error');
                }
            });
        });
    }

    // Update BMI result section
    function updateBmiResult(data) {
        // Update BMI value
        const bmiValue = document.getElementById('bmiValue');
        if (bmiValue) {
            bmiValue.textContent = data.bmi;
        }

        // Update category
        const categoryText = document.getElementById('categoryText');
        if (categoryText) {
            categoryText.textContent = data.category;

            // Update category color based on result
            if (data.category === 'Underweight') {
                categoryText.style.color = '#17a2b8'; // info blue
            } else if (data.category === 'Normal weight') {
                categoryText.style.color = '#28a745'; // success green
            } else if (data.category === 'Overweight') {
                categoryText.style.color = '#ffc107'; // warning yellow
            } else if (data.category === 'Obese') {
                categoryText.style.color = '#dc3545'; // danger red
            }
        }

        // Update recommendation
        const recommendationText = document.getElementById('recommendationText');
        if (recommendationText) {
            recommendationText.textContent = data.recommendation;
        }

        // Update BMI indicator position
        updateBmiIndicator(data.bmi);
    }

    // Update BMI indicator position based on BMI value
    function updateBmiIndicator(bmi) {
        const indicator = document.getElementById('bmiIndicator');
        if (!indicator) return;

        const scaleBar = document.querySelector('.scale-bar');
        if (!scaleBar) return;

        const scaleWidth = scaleBar.offsetWidth;

        // Calculate position based on BMI value
        let position = 0;

        if (bmi < 18.5) {
            // Underweight zone (0% - 15%)
            position = (bmi / 18.5) * 15;
        } else if (bmi < 25) {
            // Normal zone (15% - 50%)
            position = 15 + ((bmi - 18.5) / 6.5) * 35;
        } else if (bmi < 30) {
            // Overweight zone (50% - 75%)
            position = 50 + ((bmi - 25) / 5) * 25;
        } else {
            // Obese zone (75% - 100%)
            // Cap at 40 BMI for the scale
            const cappedBmi = Math.min(bmi, 40);
            position = 75 + ((cappedBmi - 30) / 10) * 25;
        }

        // Set position
        indicator.style.left = `${position}%`;
    }

    // Helper function to show notification
    function showNotification(message, type) {
        // Create notification element if it doesn't exist
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

        // Set notification type
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

        // Hide notification after 3 seconds
        setTimeout(() => {
            notification.style.opacity = '0';

            // Remove from DOM after fade out
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }
});