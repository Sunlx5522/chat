document.addEventListener("DOMContentLoaded", function () {
    // 获取管理员账号
    const adminAccount = sessionStorage.getItem('account');
    document.getElementById('adminAccount').textContent = adminAccount;

    // 加载管理员详细信息并显示模态框
    fetch(`/api/admin/info?account=${adminAccount}`)
        .then(response => response.json())
        .then(admin => {
            document.getElementById('adminAccount').textContent = admin.account || '未提供';
            document.getElementById('adminName').textContent = admin.username || '未提供';
            document.getElementById('adminPhone').textContent = admin.telephone || '未提供';
            document.getElementById('adminEmail').textContent = admin.email || '未提供';
            
            // 获取访问量数据
            fetch('/api/admin/visits')
                .then(response => response.json())
                .then(data => {
                    document.getElementById('todayVisits').textContent = data.todayVisits;
                    document.getElementById('totalVisits').textContent = data.totalVisits;
                })
                .catch(error => {
                    console.error('获取访问量数据失败:', error);
                });
            
            // 自动显示管理员信息模态框
            document.getElementById('adminInfoModal').style.display = 'block';
        })
        .catch(error => {
            console.error('加载管理员信息失败:', error);
            alert('加载管理员信息失败，请稍后重试');
        });

    // 当前页码和每页显示数量
    let currentPage = 1;
    let pageSize = 8; // 固定为8条记录
    let totalRecords = 0;
    
    // 获取用户信息
    function loadUsers(page = 1, size = 10, account = '', username = '') {
        currentPage = page;
        pageSize = size;
        
        // 构建查询参数
        const params = new URLSearchParams();
        params.append('pageNo', page);
        params.append('pageSize', size);
        if (account) params.append('account', account);
        if (username) params.append('username', username);
        
        fetch(`/api/admin/users?${params.toString()}`)
            .then(response => response.json())
            .then(data => {
                // 更新总记录数
                totalRecords = data.total;
                document.getElementById('totalRecords').textContent = totalRecords;
                // 更新最大页数
                const maxPages = Math.ceil(totalRecords / pageSize);
                document.getElementById('maxPages').textContent = maxPages;
                
                // 更新表格内容
                const tableBody = document.getElementById('userTableBody');
                tableBody.innerHTML = ''; // 清空现有用户信息
                
                // 检查是否有数据
                if (!data.list || data.list.length === 0) {
                    const emptyRow = document.createElement('tr');
                    const emptyCell = document.createElement('td');
                    emptyCell.colSpan = 7; // 更新为7列，因为添加了头像列
                    emptyCell.textContent = '没有找到符合条件的用户';
                    emptyCell.style.textAlign = 'center';
                    emptyRow.appendChild(emptyCell);
                    tableBody.appendChild(emptyRow);
                    return;
                }
                
                // 渲染用户列表
                data.list.forEach(user => {
                    const row = document.createElement('tr');

                    // 在线状态
                    const statusCell = document.createElement('td');
                    const statusIndicator = document.createElement('span');
                    statusIndicator.classList.add('status-indicator');
                    statusIndicator.classList.add(user.isonline ? 'status-online' : 'status-offline');
                    statusCell.appendChild(statusIndicator);
                    row.appendChild(statusCell);
                    
                    // 头像
                    const avatarCell = document.createElement('td');
                    avatarCell.classList.add('avatar-cell');
                    const avatarImg = document.createElement('img');
                    avatarImg.classList.add('table-avatar');
                    
                    // 从avatarData中获取头像数据，如果没有则使用默认头像
                    if (data.avatarData && data.avatarData[user.account]) {
                        avatarImg.src = data.avatarData[user.account];
                    } else {
                        avatarImg.src = '../SOURCEFILE/IMAGES/welcome/default_avatar.png';
                    }
                    
                    avatarImg.alt = `${user.username || '用户'} 的头像`;
                    
                    // 添加点击事件查看大图
                    avatarImg.style.cursor = 'pointer';
                    avatarImg.addEventListener('click', () => {
                        // 创建模态框
                        const modal = document.createElement('div');
                        modal.style.position = 'fixed';
                        modal.style.top = '0';
                        modal.style.left = '0';
                        modal.style.width = '100%';
                        modal.style.height = '100%';
                        modal.style.backgroundColor = 'rgba(0,0,0,0.8)';
                        modal.style.display = 'flex';
                        modal.style.justifyContent = 'center';
                        modal.style.alignItems = 'center';
                        modal.style.zIndex = '1000';
                        
                        // 创建大图
                        const largeImg = document.createElement('img');
                        largeImg.src = avatarImg.src;
                        largeImg.style.maxWidth = '90%';
                        largeImg.style.maxHeight = '90%';
                        largeImg.style.objectFit = 'contain';
                        
                        // 添加加载动画
                        largeImg.style.opacity = '0';
                        largeImg.style.transition = 'opacity 0.3s';
                        largeImg.onload = () => {
                            largeImg.style.opacity = '1';
                        };
                        
                        modal.appendChild(largeImg);
                        document.body.appendChild(modal);
                        
                        // 点击背景关闭
                        modal.addEventListener('click', (e) => {
                            if (e.target === modal) {
                                document.body.removeChild(modal);
                            }
                        });
                        
                        // ESC键关闭
                        const handleEsc = (e) => {
                            if (e.key === 'Escape') {
                                document.body.removeChild(modal);
                                document.removeEventListener('keydown', handleEsc);
                            }
                        };
                        document.addEventListener('keydown', handleEsc);
                    });
                    
                    avatarCell.appendChild(avatarImg);
                    row.appendChild(avatarCell);

                    // 账号
                    const accountCell = document.createElement('td');
                    accountCell.textContent = user.account || '未提供';
                    row.appendChild(accountCell);

                    // 用户名
                    const nameCell = document.createElement('td');
                    nameCell.textContent = user.username || '未提供';
                    row.appendChild(nameCell);

                    // 邮箱
                    const emailCell = document.createElement('td');
                    emailCell.textContent = user.email || '未提供';
                    row.appendChild(emailCell);

                    // 电话
                    const phoneCell = document.createElement('td');
                    phoneCell.textContent = user.telephone || '未提供';
                    row.appendChild(phoneCell);
                    // 抹除操作按钮
                    const actionsCell = document.createElement('td');
                    actionsCell.classList.add('actions-cell');
                    
                    // 头像抹除按钮
                    const avatarButton = document.createElement('button');
                    avatarButton.textContent = '头像';
                    avatarButton.classList.add('erase-button', 'avatar-erase');
                    avatarButton.addEventListener('click', () => {
                        eraseUserAvatar(user.account);
                    });
                    
                    // 用户名抹除按钮
                    const usernameButton = document.createElement('button');
                    usernameButton.textContent = '用户名';
                    usernameButton.classList.add('erase-button', 'username-erase');
                    usernameButton.addEventListener('click', () => {
                        eraseUsername(user.account);
                    });
                    
                    actionsCell.appendChild(avatarButton);
                    actionsCell.appendChild(usernameButton);
                    row.appendChild(actionsCell);

                    // 添加好友关系按钮
                    const friendshipCell = document.createElement('td');
                    const friendshipButton = document.createElement('button');
                    friendshipButton.textContent = '查看好友';
                    friendshipButton.classList.add('friendship-button');
                    friendshipButton.addEventListener('click', () => {
                        showUserFriends(user.account, user.username);
                    });
                    friendshipCell.appendChild(friendshipButton);
                    row.appendChild(friendshipCell);

                    tableBody.appendChild(row);
                });
                
                // 渲染分页控件
                renderPagination(totalRecords, currentPage, pageSize);
            })
            .catch(error => {
                console.error('获取用户信息失败:', error);
                alert('获取用户信息失败，请稍后重试');
            });
    }

    // 初始加载用户信息
    loadUsers();

    // 添加刷新按钮的事件监听器
    document.getElementById('refreshButton').addEventListener('click', () => {
        // 保留当前搜索条件和页码
        const account = document.getElementById('accountSearch').value.trim();
        const username = document.getElementById('usernameSearch').value.trim();
        loadUsers(currentPage, pageSize, account, username);
    });
    
    // 添加搜索按钮的事件监听器
    const searchButton = document.getElementById('searchButton');
    let isSearchMode = true; // 标记当前是搜索模式还是清除模式
    
    searchButton.addEventListener('click', () => {
        const account = document.getElementById('accountSearch').value.trim();
        const username = document.getElementById('usernameSearch').value.trim();
        
        if (isSearchMode) {
            // 搜索模式：执行搜索
            loadUsers(1, pageSize, account, username);
            // 如果有搜索条件，切换到清除模式
            if (account || username) {
                searchButton.textContent = '清除搜索条件';
                isSearchMode = false;
            }
        } else {
            // 清除模式：清空搜索条件并重新加载
            document.getElementById('accountSearch').value = '';
            document.getElementById('usernameSearch').value = '';
            loadUsers(1, pageSize, '', '');
            searchButton.textContent = '搜索';
            isSearchMode = true;
        }
    });
    
    // 监听输入框内容变化
    document.getElementById('accountSearch').addEventListener('input', updateSearchButtonState);
    document.getElementById('usernameSearch').addEventListener('input', updateSearchButtonState);
    
    function updateSearchButtonState() {
        // 如果当前是清除模式，且用户修改了输入框，则切换回搜索模式
        if (!isSearchMode) {
            searchButton.textContent = '搜索';
            isSearchMode = true;
        }
    }
    
    // 添加页码跳转功能
    document.getElementById('pageJumpButton').addEventListener('click', function() {
        const jumpInput = document.getElementById('pageJumpInput');
        const inputValue = jumpInput.value.trim();
        
        // 如果输入为空，默认跳转到第一页
        if (!inputValue) {
            const account = document.getElementById('accountSearch').value.trim();
            const username = document.getElementById('usernameSearch').value.trim();
            loadUsers(1, pageSize, account, username);
            return;
        }
        
        const targetPage = parseInt(inputValue);
        const maxPage = Math.ceil(totalRecords / pageSize);
        
        if (targetPage > maxPage || targetPage < 1) {
            jumpInput.value = maxPage;
            alert('输入越界, 已自动跳转为最后一页');
            const account = document.getElementById('accountSearch').value.trim();
            const username = document.getElementById('usernameSearch').value.trim();
            loadUsers(maxPage, pageSize, account, username);
        } else {
            const account = document.getElementById('accountSearch').value.trim();
            const username = document.getElementById('usernameSearch').value.trim();
            loadUsers(targetPage, pageSize, account, username);
        }
    });
    
    // 渲染分页控件
    function renderPagination(total, current, size) {
        const totalPages = Math.ceil(total / size);
        const paginationControls = document.getElementById('paginationControls');
        paginationControls.innerHTML = '';
        
        // 如果总页数为0，不显示分页
        if (totalPages === 0) return;
        
        // 上一页按钮
        const prevButton = document.createElement('button');
        prevButton.textContent = '<';
        prevButton.disabled = current === 1;
        prevButton.addEventListener('click', () => {
            if (current > 1) {
                const account = document.getElementById('accountSearch').value.trim();
                const username = document.getElementById('usernameSearch').value.trim();
                loadUsers(current - 1, pageSize, account, username);
            }
        });
        paginationControls.appendChild(prevButton);
        
        // 页码按钮
        let startPage = Math.max(1, current - 2);
        let endPage = Math.min(totalPages, startPage + 4);
        
        // 调整起始页，确保显示5个页码（如果有足够的页数）
        if (endPage - startPage < 4 && totalPages > 4) {
            startPage = Math.max(1, endPage - 4);
        }
        
        // 第一页按钮
        if (startPage > 1) {
            const firstPageButton = document.createElement('button');
            firstPageButton.textContent = '1';
            firstPageButton.addEventListener('click', () => {
                const account = document.getElementById('accountSearch').value.trim();
                const username = document.getElementById('usernameSearch').value.trim();
                loadUsers(1, pageSize, account, username);
            });
            paginationControls.appendChild(firstPageButton);
            
            // 省略号
            if (startPage > 2) {
                const ellipsis = document.createElement('span');
                ellipsis.textContent = '...';
                ellipsis.style.margin = '0 5px';
                paginationControls.appendChild(ellipsis);
            }
        }
        
        // 中间页码
        for (let i = startPage; i <= endPage; i++) {
            const pageButton = document.createElement('button');
            pageButton.textContent = i;
            if (i === current) {
                pageButton.classList.add('active');
            }
            pageButton.addEventListener('click', () => {
                const account = document.getElementById('accountSearch').value.trim();
                const username = document.getElementById('usernameSearch').value.trim();
                loadUsers(i, pageSize, account, username);
            });
            paginationControls.appendChild(pageButton);
        }
        
        // 最后一页按钮
        if (endPage < totalPages) {
            // 省略号
            if (endPage < totalPages - 1) {
                const ellipsis = document.createElement('span');
                ellipsis.textContent = '...';
                ellipsis.style.margin = '0 5px';
                paginationControls.appendChild(ellipsis);
            }
            
            const lastPageButton = document.createElement('button');
            lastPageButton.textContent = totalPages;
            lastPageButton.addEventListener('click', () => {
                const account = document.getElementById('accountSearch').value.trim();
                const username = document.getElementById('usernameSearch').value.trim();
                loadUsers(totalPages, pageSize, account, username);
            });
            paginationControls.appendChild(lastPageButton);
        }
        
        // 下一页按钮
        const nextButton = document.createElement('button');
        nextButton.textContent = '>';
        nextButton.disabled = current === totalPages || totalPages === 0;
        nextButton.addEventListener('click', () => {
            if (current < totalPages) {
                const account = document.getElementById('accountSearch').value.trim();
                const username = document.getElementById('usernameSearch').value.trim();
                loadUsers(current + 1, pageSize, account, username);
            }
        });
        paginationControls.appendChild(nextButton);
        
        // 设置页码跳转输入框的最大值
        const pageJumpInput = document.getElementById('pageJumpInput');
        pageJumpInput.max = totalPages;
        pageJumpInput.placeholder = `页码 (1-${totalPages})`;
    }

    // 添加管理员信息按钮事件监听器
    document.getElementById('adminInfoButton').addEventListener('click', () => {
        document.getElementById('adminInfoModal').style.display = 'block';
    });

    // 添加管理员信息模态框关闭按钮事件监听器
    document.getElementById('closeAdminInfo').addEventListener('click', () => {
        document.getElementById('adminInfoModal').style.display = 'none';
    });

    // 创建通知提示框
    function showNotification(message, isSuccess) {
        // 创建通知元素
        const notification = document.createElement('div');
        notification.className = `notification ${isSuccess ? 'success' : 'error'}`;
        notification.innerHTML = `
            <div class="notification-icon">
                <span class="${isSuccess ? 'success-icon' : 'error-icon'}">&#${isSuccess ? '10004' : '10008'};</span>
            </div>
            <div class="notification-message">${message}</div>
        `;
        
        // 添加到页面
        document.body.appendChild(notification);
        
        // 显示动画
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);
        
        // 自动关闭
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }
    
        // 显示确认对话框
    function showConfirmDialog(title, message, contentType, contentData) {
        return new Promise((resolve) => {
            const overlay = document.getElementById('confirmDialogOverlay');
            const dialog = document.getElementById('confirmDialog');
            const titleElement = document.getElementById('confirmDialogTitle');
            const contentElement = document.getElementById('confirmDialogContent');
            const messageElement = document.getElementById('confirmDialogMessage');
            const confirmButton = document.getElementById('confirmDialogConfirm');
            const cancelButton = document.getElementById('confirmDialogCancel');

            titleElement.textContent = title;
            messageElement.textContent = message;
            
            // 清空内容区域
            contentElement.innerHTML = '';
            
            // 根据内容类型添加相应的元素
            if (contentType === 'avatar' && contentData) {
                const avatarImg = document.createElement('img');
                avatarImg.src = contentData;
                avatarImg.alt = '用户头像';
                avatarImg.classList.add('confirm-dialog-avatar');
                contentElement.appendChild(avatarImg);
            } else if (contentType === 'username' && contentData) {
                const usernameDiv = document.createElement('div');
                usernameDiv.textContent = contentData;
                usernameDiv.classList.add('confirm-dialog-username');
                contentElement.appendChild(usernameDiv);
            }

            overlay.style.display = 'block';
            setTimeout(() => {
                overlay.classList.add('show');
                dialog.classList.add('show');
            }, 10);

            const closeDialog = () => {
                dialog.classList.remove('show');
                overlay.classList.remove('show');
                setTimeout(() => {
                    overlay.style.display = 'none';
                    // 清空内容区域
                    contentElement.innerHTML = '';
                }, 300);
            };

            const handleConfirm = () => {
                closeDialog();
                resolve(true);
                confirmButton.removeEventListener('click', handleConfirm);
                cancelButton.removeEventListener('click', handleCancel);
            };

            const handleCancel = () => {
                closeDialog();
                resolve(false);
                confirmButton.removeEventListener('click', handleConfirm);
                cancelButton.removeEventListener('click', handleCancel);
            };

            confirmButton.addEventListener('click', handleConfirm);
            cancelButton.addEventListener('click', handleCancel);
        });
    }

    // 抹除用户头像
    async function eraseUserAvatar(account) {
        // 获取用户头像
        let avatarSrc = '../SOURCEFILE/IMAGES/welcome/default_avatar.png';
        
        // 遍历表格行查找匹配的账号
        const rows = document.querySelectorAll('#userTableBody tr');
        for (const row of rows) {
            const accountCell = row.querySelector('td:nth-child(3)');
            if (accountCell && accountCell.textContent.trim() === account) {
                const avatarImg = row.querySelector('.table-avatar');
                if (avatarImg) {
                    avatarSrc = avatarImg.src;
                }
                break;
            }
        }
        
        const confirmed = await showConfirmDialog(
            '抹除头像确认',
            '确定要抹除该用户的头像吗？此操作不可撤销。',
            'avatar',
            avatarSrc
        );

        if (confirmed) {
            try {
                const response = await fetch('/api/admin/eraseAvatar', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    },
                    body: `account=${account}`
                });
                const result = await response.text();

                if (result === 'success') {
                    showNotification('头像抹除成功', true);
                    // 刷新用户列表
                    const accountSearch = document.getElementById('accountSearch').value.trim();
                    const usernameSearch = document.getElementById('usernameSearch').value.trim();
                    loadUsers(currentPage, pageSize, accountSearch, usernameSearch);
                } else {
                    showNotification('头像抹除失败，请稍后重试', false);
                }
            } catch (error) {
                console.error('头像抹除请求失败:', error);
                showNotification('头像抹除请求失败，请稍后重试', false);
            }
        }
    }
    
    // 抹除用户名
    async function eraseUsername(account) {
        // 获取用户名
        let username = '';
        
        // 遍历表格行查找匹配的账号
        const rows = document.querySelectorAll('#userTableBody tr');
        for (const row of rows) {
            const accountCell = row.querySelector('td:nth-child(3)');
            if (accountCell && accountCell.textContent.trim() === account) {
                const usernameCell = row.querySelector('td:nth-child(4)');
                if (usernameCell) {
                    username = usernameCell.textContent.trim();
                }
                break;
            }
        }
        
        const confirmed = await showConfirmDialog(
            '抹除用户名确认',
            '确定要抹除该用户的用户名吗？此操作不可撤销。',
            'username',
            username
        );

        if (confirmed) {
            try {
                const response = await fetch('/api/admin/eraseUsername', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    },
                    body: `account=${account}`
                });
                const result = await response.text();

                if (result === 'success') {
                    showNotification('用户名抹除成功', true);
                    // 刷新用户列表
                    const accountSearch = document.getElementById('accountSearch').value.trim();
                    const usernameSearch = document.getElementById('usernameSearch').value.trim();
                    loadUsers(currentPage, pageSize, accountSearch, usernameSearch);
                } else {
                    showNotification('用户名抹除失败，请稍后重试', false);
                }
            } catch (error) {
                console.error('用户名抹除请求失败:', error);
                showNotification('用户名抹除请求失败，请稍后重试', false);
            }
        }
    }

    // 添加好友关系模态框关闭按钮事件监听器
    document.getElementById('closeFriendship').addEventListener('click', () => {
        document.getElementById('friendshipModal').style.display = 'none';
    });

    // 获取多级好友关系
    async function fetchMultiLevelFriends(account) {
        try {
            showNotification('正在加载好友关系...', true);
            
            // 使用新的friendNetwork接口获取完整好友网络
            const response = await fetch(`/api/admin/friendNetwork?account=${account}`);
            const data = await response.json();
            if (!data || !data.account) {
                showNotification('获取好友关系失败', false);
                return null;
            }
            return data;
        } catch (error) {
            console.error('获取多级好友失败:', error);
            showNotification('获取好友关系失败', false);
            return null;
        }
    }

    // 显示用户好友关系
    async function showUserFriends(account, username) {
        try {
            // 获取完整好友网络数据
            const data = await fetchMultiLevelFriends(account);
            if (!data) {
                return;
            }

            // 更新模态框内容
            document.getElementById('selectedUserAccount').textContent = data.account;
            document.getElementById('selectedUserUsername').textContent = data.username;
            document.getElementById('selectedUserAvatar').src = data.avatar;

            // 清空并更新好友列表
            const friendsList = document.getElementById('friendsList');
            friendsList.innerHTML = '';

            if (!data.friends || data.friends.length === 0) {
                const noFriends = document.createElement('div');
                noFriends.className = 'no-friends';
                noFriends.textContent = '暂无好友';
                friendsList.appendChild(noFriends);
            } else {
                // 只显示直接好友
                data.friends.forEach(friend => {
                    const friendCard = document.createElement('div');
                    friendCard.className = 'friend-card';
                    
                    const friendAvatar = document.createElement('img');
                    friendAvatar.src = friend.avatar;
                    friendAvatar.alt = `${friend.username}的头像`;
                    friendAvatar.className = 'friend-avatar';
                    
                    const friendInfo = document.createElement('div');
                    friendInfo.className = 'friend-info';
                    
                    friendInfo.innerHTML = `
                        <p class="friend-username">${friend.username}</p>
                        <p class="friend-account">${friend.account}</p>
                    `;
                    
                    friendCard.appendChild(friendAvatar);
                    friendCard.appendChild(friendInfo);
                    friendsList.appendChild(friendCard);
                });
            }

            // 创建网络图（保持完整的好友网络显示）
            createNetworkGraph(data);

            // 显示模态框
            document.getElementById('friendshipModal').style.display = 'block';
        } catch (error) {
            console.error('获取好友关系失败:', error);
            showNotification('获取好友关系失败，请稍后重试', false);
        }
    }

    // 创建多级好友网络图
    function createNetworkGraph(data) {
        const nodes = new vis.DataSet();
        const edges = new vis.DataSet();
        const visitedNodes = new Set();

        // 递归添加节点和边
        function addNodeAndEdges(user, parentId = null) {
            const nodeId = user.account;
            
            // 如果节点已访问过，只需要添加与父节点的边（如果父节点存在）
            if (visitedNodes.has(nodeId)) {
                if (parentId) {
                    edges.add({
                        from: parentId,
                        to: nodeId,
                        color: {
                            color: '#757575',
                            opacity: 0.8
                        },
                        width: 2,
                        smooth: {
                            type: 'continuous',
                            roundness: 0.5
                        }
                    });
                }
                return;
            }

            // 添加节点
            nodes.add({
                id: nodeId,
                label: user.username,
                title: `账号: ${user.account}`,
                color: {
                    background: parentId ? '#2196F3' : '#4CAF50',
                    border: parentId ? '#1565C0' : '#2E7D32'
                },
                font: {
                    color: 'white',
                    size: parentId ? 14 : 16
                },
                shape: 'dot',
                size: parentId ? 25 : 30
            });
            visitedNodes.add(nodeId);

            // 添加与父节点之间的边
            if (parentId) {
                edges.add({
                    from: parentId,
                    to: nodeId,
                    color: {
                        color: '#757575',
                        opacity: 0.8
                    },
                    width: 2,
                    smooth: {
                        type: 'continuous',
                        roundness: 0.5
                    }
                });
            }

            // 递归处理好友
            if (user.friends) {
                user.friends.forEach(friend => {
                    addNodeAndEdges(friend, nodeId);
                });
            }
        }

        // 从中心用户开始递归添加节点和边
        addNodeAndEdges(data);

        // 配置网络图选项
        const options = {
            nodes: {
                borderWidth: 2,
                shadow: true
            },
            edges: {
                shadow: true,
                smooth: {
                    type: 'continuous',
                    roundness: 0.5
                }
            },
            physics: {
                enabled: true,
                solver: 'forceAtlas2Based',
                forceAtlas2Based: {
                    gravitationalConstant: -50,
                    centralGravity: 0.05,
                    springLength: 150,
                    springConstant: 0.05
                },
                stabilization: {
                    enabled: true,
                    iterations: 1000
                }
            },
            layout: {
                improvedLayout: true,
                hierarchical: {
                    enabled: false
                }
            }
        };

        // 创建网络图
        const container = document.getElementById('network');
        container.innerHTML = '';
        const network = new vis.Network(container, { nodes, edges }, options);

        // 添加点击事件处理
        network.on('click', function(params) {
            if (params.nodes.length > 0) {
                const nodeId = params.nodes[0];
                const node = nodes.get(nodeId);
                if (node) {
                    showNotification(`选中用户: ${node.label}`, true);
                }
            }
        });

        // 添加悬停事件处理
        network.on('hoverNode', function(params) {
            const nodeId = params.node;
            const node = nodes.get(nodeId);
            if (node) {
                showNotification(`悬停用户: ${node.label}`, true);
            }
        });
    }

    // 添加退出按钮事件监听器
    document.getElementById('exitButton').addEventListener('click', () => {
        const account = sessionStorage.getItem('account');
        // 发送退出请求
        fetch('/api/admin/logout', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: `account=${account}`
        })
        .then(response => response.text())
        .then(result => {
            if (result === 'success') {
                // 清除会话存储中的管理员账号
                sessionStorage.removeItem('account');
                // 重定向到登录页面
                window.location.href = '../HTML/index.html';
            } else {
                alert('退出失败，请稍后重试');
            }
        })
        .catch(error => {
            console.error('退出请求失败:', error);
            alert('退出请求失败，请稍后重试');
        });
    });

    // 获取监控数据
    function fetchMonitorData() {
        // 获取系统资源数据
        fetch('/api/admin/monitor/system')
            .then(response => response.json())
            .then(data => {
                const cpuUsage = data.cpuUsage || 0;
                const memoryUsage = (data.heapMemoryUsed / (1024 * 1024)).toFixed(2);
                
                document.getElementById('cpuUsage').textContent = `${cpuUsage.toFixed(2)}%`;
                document.getElementById('memoryUsage').textContent = `${memoryUsage} MB`;
            });

        // 获取数据库数据
        fetch('/api/admin/monitor/database')
            .then(response => response.json())
            .then(data => {
                document.getElementById('dbActiveConnections').textContent = data.activeConnections || 0;
                document.getElementById('dbTotalConnections').textContent = data.totalConnections || 0;
                document.getElementById('dbMaxConnections').textContent = data.maxConnections || 0;
                
                const totalSize = data.tableSizes.reduce((sum, table) => sum + parseFloat(table.size_mb), 0);
                document.getElementById('dbSize').textContent = `${totalSize.toFixed(2)} MB`;
            });

        // 获取应用数据
        fetch('/api/admin/monitor/application')
            .then(response => response.json())
            .then(data => {
                document.getElementById('onlineUsers').textContent = data.onlineUsers || 0;
                document.getElementById('todayMessages').textContent = data.todayMessages || 0;
                document.getElementById('todayFriendRequests').textContent = data.todayFriendRequests || 0;
            });
    }

    // 添加监控按钮事件监听器
    document.getElementById('monitorButton').addEventListener('click', () => {
        document.getElementById('monitorModal').style.display = 'block';
        // 开始定时获取监控数据
        fetchMonitorData();
        const monitorInterval = setInterval(fetchMonitorData, 5000); // 每5秒更新一次
        
        // 当模态框关闭时清除定时器
        document.getElementById('closeMonitor').addEventListener('click', () => {
            document.getElementById('monitorModal').style.display = 'none';
            clearInterval(monitorInterval);
        });
    });
});