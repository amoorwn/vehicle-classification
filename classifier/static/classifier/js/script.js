// document.addEventListener('DOMContentLoaded', () => {
//     document.body.style.backgroundColor = "#f0f9ff"; // Thay đổi màu nền toàn bộ trang

//     const dropZone = document.getElementById('drop-zone');
//     const fileInput = document.getElementById('file-input');
//     const uploadBtn = document.getElementById('upload-btn');
//     const originalImage = document.getElementById('original-image');
//     const processedImage = document.getElementById('processed-image');
//     const predictedClass = document.getElementById('predicted-class');
//     const confidence = document.getElementById('confidence');
//     const resultSection = document.getElementById('result-section');

//     // Get CSRF token from cookie
//     function getCookie(name) {
//         let cookieValue = null;
//         if (document.cookie && document.cookie !== '') {
//             const cookies = document.cookie.split(';');
//             for (let i = 0; i < cookies.length; i++) {
//                 const cookie = cookies[i].trim();
//                 if (cookie.substring(0, name.length + 1) === (name + '=')) {
//                     cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
//                     break;
//                 }
//             }
//         }
//         return cookieValue;
//     }

//     const csrftoken = getCookie('csrftoken');

//     // Function to assign colors based on predicted class
//     function getColorByClass(prediction) {
//         const colorMap = {
//             'bike': '#e8cbc4ff',    // Cam
//             'car': '#157a27ff',     // Xanh lá
//             'motorcycle': '#3357FF', // Xanh dương
//             'plane': '#686e19ff',   // Vàng
//             'ship': '#FF33F3',    // Hồng
//             'train': '#07514dff',    // Xanh ngọc
//             'bus': '#9f2525ff'
//         };
//         return colorMap[prediction] || '#000000'; // Default black if class not found
//     }

//     // Handle file input
//     dropZone.addEventListener('click', () => fileInput.click());
//     uploadBtn.addEventListener('click', () => fileInput.click());

//     fileInput.addEventListener('change', handleFileUpload);

//     // Drag and drop functionality
//     dropZone.addEventListener('dragover', (e) => {
//         e.preventDefault();
//         dropZone.style.backgroundColor = '#e0e0e0';
//     });

//     dropZone.addEventListener('dragleave', () => {
//         dropZone.style.backgroundColor = '';
//     });

//     dropZone.addEventListener('drop', (e) => {
//         e.preventDefault();
//         dropZone.style.backgroundColor = '';
//         const files = e.dataTransfer.files;
//         if (files.length > 0) {
//             handleFileUpload({ target: { files } });
//         }
//     });

//     function handleFileUpload(event) {
//         const file = event.target.files[0];
//         if (!file) return;

//         // Hiển thị loading
//         dropZone.innerHTML = "⏳ Predicting...";

//         const reader = new FileReader();
//         reader.onload = (e) => {
//             // Display original image
//             originalImage.src = e.target.result;
//             resultSection.style.display = 'flex';

//             // Prepare FormData for POST request
//             const formData = new FormData();
//             formData.append('image', file);

//             // Send prediction request
//             fetch('/predict/', {
//                 method: 'POST',
//                 headers: {
//                     'X-CSRFToken': csrftoken,
//                 },
//                 body: formData,
//             })
//                 .then(response => response.json())
//                 .then(data => {
//                     // Change text color based on prediction
//                     predictedClass.style.color = getColorByClass(data.prediction);

//                     // Display processed image
//                     processedImage.src = data.processed_image;
//                     // Display prediction
//                     predictedClass.innerText = data.prediction;
//                     confidence.innerText = data.confidence;

//                     // Reset drop zone text
//                     dropZone.innerHTML = `
//                         <p>Drag & Drop Image Here</p>
//                         <p>or</p>
//                         <button id="upload-btn">Upload Image</button>
//                         <input type="file" id="file-input" accept="image/*" hidden>
//                     `;
//                 })
//                 .catch(error => {
//                     console.error('Error:', error);
//                     alert('Prediction failed. Check console for details.');

//                     // Reset drop zone text in case of error
//                     dropZone.innerHTML = `
//                         <p>Drag & Drop Image Here</p>
//                         <p>or</p>
//                         <button id="upload-btn">Upload Image</button>
//                         <input type="file" id="file-input" accept="image/*" hidden>
//                     `;
//                 });
//         };
//         reader.readAsDataURL(file);
//     }
// });

// script.js
document.addEventListener('DOMContentLoaded', () => {
    const dropZone = document.getElementById('drop-zone');
    const fileInput = document.getElementById('file-input');
    const uploadBtn = document.getElementById('upload-btn');
    const originalImage = document.getElementById('original-image');
    const processedImage = document.getElementById('processed-image');
    const predictedClass = document.getElementById('predicted-class');
    const confidence = document.getElementById('confidence');
    const resultSection = document.getElementById('result-section');
    const historyList = document.getElementById('history-list');

    // Get CSRF token
    function getCookie(name) {
        let cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            const cookies = document.cookie.split(';');
            for (let i = 0; i < cookies.length; i++) {
                const cookie = cookies[i].trim();
                if (cookie.substring(0, name.length + 1) === (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }

    const csrftoken = getCookie('csrftoken');

    // Color mapping
    function getColorByClass(prediction) {
        const colorMap = {
            'bike': '#FF6B35',
            'car': '#4ECDC4',
            'motorcycle': '#5D5FEF',
            'plane': '#FFD93D',
            'ship': '#F72585',
            'train': '#06FFA5',
            'bus': '#FF4E50'
        };
        return colorMap[prediction] || '#667eea';
    }

    // Handle file upload
    dropZone.addEventListener('click', () => fileInput.click());
    
    if (uploadBtn) {
        uploadBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            fileInput.click();
        });
    }

    fileInput.addEventListener('change', handleFileUpload);

    // Drag and drop
    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.style.background = 'rgba(255, 255, 255, 0.3)';
    });

    dropZone.addEventListener('dragleave', () => {
        dropZone.style.background = 'rgba(255, 255, 255, 0.1)';
    });

    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.style.background = 'rgba(255, 255, 255, 0.1)';
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleFileUpload({ target: { files } });
        }
    });

    function handleFileUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        // Show loading
        dropZone.innerHTML = `
            <i class="fas fa-spinner fa-spin fa-3x"></i>
            <p>Analyzing image...</p>
        `;

        const reader = new FileReader();
        reader.onload = (e) => {
            originalImage.src = e.target.result;
            resultSection.style.display = 'block';

            const formData = new FormData();
            formData.append('image', file);

            fetch('/predict/', {
                method: 'POST',
                headers: {
                    'X-CSRFToken': csrftoken,
                },
                body: formData,
            })
            .then(response => response.json())
            .then(data => {
                if (data.error) {
                    alert('Error: ' + data.error);
                    resetDropZone();
                    return;
                }

                // Display results
                processedImage.src = data.processed_image;
                predictedClass.innerText = data.prediction;
                predictedClass.style.color = getColorByClass(data.prediction);
                confidence.innerText = data.confidence + '%';

                // Update history
                updateHistory(data.history);

                // Reset drop zone
                resetDropZone();

                // Scroll to result
                resultSection.scrollIntoView({ behavior: 'smooth' });
            })
            .catch(error => {
                console.error('Error:', error);
                alert('Prediction failed. Check console for details.');
                resetDropZone();
            });
        };
        reader.readAsDataURL(file);
    }

    function resetDropZone() {
        dropZone.innerHTML = `
            <i class="fas fa-cloud-upload-alt fa-3x"></i>
            <p>Drag & Drop Image Here</p>
            <p>or</p>
            <button id="upload-btn"><i class="fas fa-upload"></i> Upload Image</button>
            <input type="file" id="file-input" accept="image/*" hidden>
        `;
        
        // Re-attach event listeners
        const newUploadBtn = document.getElementById('upload-btn');
        const newFileInput = document.getElementById('file-input');
        
        if (newUploadBtn) {
            newUploadBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                newFileInput.click();
            });
        }
        
        newFileInput.addEventListener('change', handleFileUpload);
    }

    function updateHistory(historyData) {
        if (!historyData || historyData.length === 0) {
            historyList.innerHTML = '<p class="no-history">No predictions yet</p>';
            return;
        }

        historyList.innerHTML = '';
        historyData.forEach(item => {
            const historyItem = document.createElement('div');
            historyItem.className = 'history-item';
            historyItem.dataset.id = item.id;
            
            historyItem.innerHTML = `
                <img src="${item.image_url}" alt="History Image">
                <div class="history-info">
                    <p class="history-class" style="color: ${getColorByClass(item.predicted_class)}">
                        ${item.predicted_class}
                    </p>
                    <p class="history-confidence">${item.confidence}%</p>
                    <p class="history-time">${item.timestamp}</p>
                </div>
                <button class="delete-btn" onclick="deleteHistory(${item.id})">
                    <i class="fas fa-trash"></i>
                </button>
            `;
            
            historyList.appendChild(historyItem);
        });
    }

    // Make deleteHistory global
    window.deleteHistory = function(historyId) {
        if (!confirm('Are you sure you want to delete this prediction?')) {
            return;
        }

        fetch(`/delete/${historyId}/`, {
            method: 'POST',
            headers: {
                'X-CSRFToken': csrftoken,
                'Content-Type': 'application/json'
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                updateHistory(data.history);
            } else {
                alert('Failed to delete: ' + (data.error || 'Unknown error'));
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Failed to delete item');
        });
    };
});