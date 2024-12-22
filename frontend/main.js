document.addEventListener('DOMContentLoaded', () => {
    const taskForm = document.getElementById('task-form');
    const taskList = document.getElementById('task-list');
    const editModal = document.getElementById('edit-modal');
    const editTaskForm = document.getElementById('edit-task-form');
    const editDescription = document.getElementById('edit-description');
    const editCategory = document.getElementById('edit-category');
    const closeModal = document.querySelector('.close');
    let currentTaskId = null;

    // Fetch and display tasks
    const fetchTasks = async () => {
        try {
            const response = await fetch('http://localhost:3000/tasks');
            const tasks = await response.json();
            taskList.innerHTML = '';
            tasks.forEach(task => {
                const taskCard = document.createElement('div');
                taskCard.classList.add('task-card');
                taskCard.innerHTML = `
                    <div>
                        <input type="checkbox" class="task-status" data-id="${task._id}" ${task.status === 'completed' ? 'checked' : ''}>
                        <strong>Description:</strong> ${task.description}<br>
                        <strong>Category:</strong> ${task.category}<br>
                        <strong>Status:</strong> ${task.status}
                    </div>
                    <div class="burger-menu">
                        <div></div>
                        <div></div>
                        <div></div>
                    </div>
                    <div class="menu-options">
                        <a href="#" class="edit-task" data-id="${task._id}">Edit</a>
                        <a href="#" class="delete-task" data-id="${task._id}">Delete</a>
                    </div>
                `;
                if (task.status === 'completed') {
                    taskCard.classList.add('completed');
                }

                const checkbox = taskCard.querySelector('input[type="checkbox"]');
                checkbox.addEventListener('change', async () => {
                    const newStatus = checkbox.checked ? 'completed' : 'pending';
                    try {
                        await fetch(`http://localhost:3000/tasks/${task._id}/complete`, {
                            method: 'PUT',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({ status: newStatus })
                        });
                        fetchTasks();
                    } catch (error) {
                        console.error('Error updating task:', error);
                    }
                });

                const burgerMenu = taskCard.querySelector('.burger-menu');
                const menuOptions = taskCard.querySelector('.menu-options');
                burgerMenu.addEventListener('click', (e) => {
                    e.stopPropagation();
                    menuOptions.style.display = menuOptions.style.display === 'block' ? 'none' : 'block';
                });

                document.addEventListener('click', (e) => {
                    if (!burgerMenu.contains(e.target)) {
                        menuOptions.style.display = 'none';
                    }
                });

                document.addEventListener('keydown', (e) => { 
                    if (e.key === 'Escape') {
                        menuOptions.style.display = 'none';
                    }
                });

                const deleteTask = taskCard.querySelector('.delete-task');
                deleteTask.addEventListener('click', async (e) => {
                    e.preventDefault();
                    try {
                        await fetch(`http://localhost:3000/tasks/${task._id}`, {
                            method: 'DELETE'
                        });
                        fetchTasks();
                    } catch (error) {
                        console.error('Error deleting task:', error);
                    }
                });

                const editTask = taskCard.querySelector('.edit-task');
                editTask.addEventListener('click', (e) => {
                    e.preventDefault();
                    currentTaskId = task._id;
                    editDescription.value = task.description;
                    editCategory.value = task.category;
                    editModal.style.display = 'block';
                });

                taskList.appendChild(taskCard);
            });
        } catch (error) {
            console.error('Error fetching tasks:', error);
        }
    };

    // Add a new task
    taskForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const description = document.getElementById('description').value;
        const category = document.getElementById('category').value;

        try {
            const response = await fetch('http://localhost:3000/tasks', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ description, category, status: 'pending' })
            });
            if (!response.ok) {
                const errorMessage = await response.text();
                alert(`Error: ${errorMessage}`);
                return;
            }
            taskForm.reset();
            fetchTasks();
        } catch (error) {
            console.error('Error adding task:', error);
        }
    });


    editTaskForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const description = editDescription.value;
        const category = editCategory.value;

        try {
            const response = await fetch(`http://localhost:3000/tasks/${currentTaskId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ description, category })
            });
            if (!response.ok) {
                const errorMessage = await response.text();
                alert(`Error: ${errorMessage}`);
                return;
            }
            editModal.style.display = 'none';
            fetchTasks();
        } catch (error) {
            console.error('Error editing task:', error);
        }
    });

    // Close the modal
    closeModal.addEventListener('click', () => {
        editModal.style.display = 'none';
    });

    // Close the modal when clicking outside of it
    window.addEventListener('click', (e) => {
        if (e.target === editModal) {
            editModal.style.display = 'none';
        }
    });

    fetchTasks();
});