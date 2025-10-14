// Forum System Implementation
let forumInstance = null;
let currentPost = null;
let anonymousUsername = null;

// Initialize currentCommunity if not already declared
if (typeof currentCommunity === 'undefined') {
    var currentCommunity = 'depression';
}

async function getUserForumUid() {
    try {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (currentUser && currentUser.id) {
            const response = await fetch(`/api/forum?action=user&userId=${currentUser.id}`);
            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    anonymousUsername = data.username;
                    return data.username;
                }
            }
        }
    } catch (err) {
        console.log('Failed to get user forum UID:', err);
    }
    return null;
}

function initializeForum(username, community, post, screenFunc) {
    anonymousUsername = username;
    currentCommunity = community || 'depression';
    currentPost = post;
    
    console.log('Forum initialized with community:', currentCommunity);
    
    // Get user's forum UID from database
    getUserForumUid();
    
    forumInstance = createForumInstance();
    return forumInstance;
}

function createForumInstance() {
    const samplePosts = {};
    const sampleComments = {};

    // Forum functions
    async function loadPosts() {
        const container = document.getElementById('posts-container');
        if (!container) return;
        
        console.log('Loading posts for community:', currentCommunity);
        
        try {
            const url = `/api/forum?action=posts&community=${currentCommunity}&userUid=${encodeURIComponent(anonymousUsername)}`;
            console.log('Fetching posts from:', url);
            const response = await fetch(url);
            if (response.ok) {
                const posts = await response.json();
                console.log('Received posts:', posts.length, 'for community:', currentCommunity);
                displayPosts(posts);
            } else {
                console.error('Failed to load posts:', response.status);
                displayPosts([]);
            }
        } catch (err) {
            console.error('Error loading posts:', err);
            displayPosts([]);
        }
    }

    function displayPosts(posts) {
        const container = document.getElementById('posts-container');
        if (posts.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: var(--text-secondary);">No posts yet. Be the first to post!</p>';
            return;
        }
        
        container.innerHTML = posts.map(post => {
            const voteScore = (post.upvotes || 0) - (post.downvotes || 0);
            const isOwnPost = post.author_uid === anonymousUsername;
            const isAdmin = anonymousUsername === 'u/kklt3o' || anonymousUsername === 'admin@chetana.com' || anonymousUsername === 'admin';
            const isWelcomePost = post.title && (post.title.toLowerCase().includes('welcome') || post.title.toLowerCase().includes('community guidelines'));
            const canDelete = isOwnPost || isAdmin; // Admins can delete any post, including welcome posts
            const canPin = isAdmin;
            const canReport = !isOwnPost && anonymousUsername && !isWelcomePost;
            const voteButtonsDisabled = isOwnPost ? 'disabled style="opacity: 0.5; cursor: not-allowed;"' : '';
            const isPinned = post.pinned;
            
            const upvoteActive = post.user_vote === 'upvote' ? 'active' : '';
            const downvoteActive = post.user_vote === 'downvote' ? 'active' : '';
            
            return `
                <div class="post-card ${isPinned ? 'pinned-post' : ''}" data-post-id="${post.id}">
                    <div class="post-header">
                        <span class="post-author">${post.author_uid}</span>
                        <span class="post-time">${new Date(post.created_at).toLocaleDateString()}</span>
                        ${isPinned ? '<span class="pin-badge">📌 Pinned</span>' : ''}
                        ${canPin ? `<button class="pin-btn" data-post-id="${post.id}" data-type="post">📌</button>` : ''}
                        ${canDelete ? `<button class="delete-btn" data-post-id="${post.id}" data-type="post">🗑️</button>` : ''}
                        ${canReport ? `<button class="report-btn" data-post-id="${post.id}" data-type="post">🚩</button>` : ''}
                    </div>
                    <h3 class="post-title">${post.title}</h3>
                    <p class="post-content">${post.content.substring(0, 200)}${post.content.length > 200 ? '...' : ''}</p>
                    <div class="post-actions">
                        <div class="vote-buttons">
                            <button class="vote-btn upvote ${upvoteActive}" data-post-id="${post.id}" data-type="upvote" ${voteButtonsDisabled}>▲</button>
                            <span class="vote-count">${voteScore}</span>
                            <button class="vote-btn downvote ${downvoteActive}" data-post-id="${post.id}" data-type="downvote" ${voteButtonsDisabled}>▼</button>
                        </div>
                        <span class="comment-count">${post.comment_count || 0} comments</span>
                    </div>
                </div>
            `;
        }).join('');
        
        // Add click handlers
        container.querySelectorAll('.post-card').forEach(card => {
            card.addEventListener('click', (e) => {
                if (e.target.classList.contains('vote-btn') || e.target.classList.contains('delete-btn')) return;
                const postId = parseInt(card.dataset.postId);
                openPost(postId);
            });
        });
        
        container.querySelectorAll('.vote-btn:not([disabled])').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                votePost(parseInt(btn.dataset.postId), btn.dataset.type);
            });
        });
        
        container.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                deleteContent(btn.dataset.type, parseInt(btn.dataset.postId));
            });
        });
        
        container.querySelectorAll('.pin-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                pinContent(btn.dataset.type, parseInt(btn.dataset.postId));
            });
        });
        
        container.querySelectorAll('.report-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                showReportModal(btn.dataset.type, parseInt(btn.dataset.postId));
            });
        });
    }

    function openPost(postId) {
        let foundPost = null;
        for (const community in samplePosts) {
            foundPost = samplePosts[community].find(p => p.id === postId);
            if (foundPost) break;
        }
        
        if (foundPost) {
            currentPost = foundPost;
            displayPostDetail();
            loadComments(postId);
            showScreen('post-screen');
        }
    }

    function displayPostDetail() {
        if (!currentPost) return;
        
        const voteScore = (currentPost.upvotes || 0) - (currentPost.downvotes || 0);
        const isOwnPost = currentPost.author_uid === anonymousUsername;
        const isAdmin = anonymousUsername === 'u/kklt3o' || anonymousUsername === 'admin@chetana.com' || anonymousUsername === 'admin';
        const isWelcomePost = currentPost.title && (currentPost.title.toLowerCase().includes('welcome') || currentPost.title.toLowerCase().includes('community guidelines'));
        const canDelete = isOwnPost || isAdmin; // Admins can delete any post, including welcome posts
        const voteButtonsDisabled = isOwnPost ? 'disabled style="opacity: 0.5; cursor: not-allowed;"' : '';
        const isPinned = currentPost.pinned;
        
        const upvoteActive = currentPost.user_vote === 'upvote' ? 'active' : '';
        const downvoteActive = currentPost.user_vote === 'downvote' ? 'active' : '';
        
        document.getElementById('post-detail').innerHTML = `
            <div class="post-card ${isPinned ? 'pinned-post' : ''}">
                <div class="post-header">
                    <span class="post-author">${currentPost.author_uid}</span>
                    <span class="post-time">${new Date(currentPost.created_at).toLocaleDateString()}</span>
                    ${isPinned ? '<span class="pin-badge">📌 Pinned</span>' : ''}
                    ${canDelete ? `<button class="delete-btn" data-post-id="${currentPost.id}" data-type="post">🗑️ Delete Post</button>` : ''}
                </div>
                <h2 class="post-title">${currentPost.title}</h2>
                <p class="post-content">${currentPost.content}</p>
                <div class="post-actions">
                    <div class="vote-buttons">
                        <button class="vote-btn upvote ${upvoteActive}" data-post-id="${currentPost.id}" data-type="upvote" ${voteButtonsDisabled}>▲</button>
                        <span class="vote-count">${voteScore}</span>
                        <button class="vote-btn downvote ${downvoteActive}" data-post-id="${currentPost.id}" data-type="downvote" ${voteButtonsDisabled}>▼</button>
                    </div>
                </div>
            </div>
        `;
        
        document.querySelectorAll('#post-detail .vote-btn:not([disabled])').forEach(btn => {
            btn.addEventListener('click', () => {
                votePost(parseInt(btn.dataset.postId), btn.dataset.type);
            });
        });
        
        document.querySelectorAll('#post-detail .delete-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                deleteContent(btn.dataset.type, parseInt(btn.dataset.postId));
            });
        });
    }

    async function loadComments(postId) {
        try {
            await new Promise(resolve => setTimeout(resolve, 100)); // Rate limit delay
            const response = await fetch(`/api/forum?action=comments&postId=${postId}&userUid=${encodeURIComponent(anonymousUsername)}`);
            if (response.ok) {
                const comments = await response.json();
                displayComments(comments);
            } else {
                displayComments([]);
            }
        } catch (err) {
            displayComments([]);
        }
    }

    function displayComments(comments) {
        const container = document.getElementById('comments-container');
        if (!container) return;
        
        if (comments.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: var(--text-secondary);">No comments yet. Be the first to comment!</p>';
            return;
        }
        
        container.innerHTML = comments.map(comment => {
            const voteScore = (comment.upvotes || 0) - (comment.downvotes || 0);
            const isOwnComment = comment.author_uid === anonymousUsername;
            const isAdmin = anonymousUsername === 'u/kklt3o' || anonymousUsername === 'admin@chetana.com' || anonymousUsername === 'admin';
            const isWelcomePost = currentPost && currentPost.title && (currentPost.title.toLowerCase().includes('welcome') || currentPost.title.toLowerCase().includes('community guidelines'));
            const canDelete = isOwnComment || isAdmin; // Admins can delete any comment, even on welcome posts
            const canPin = isAdmin;
            const canReport = !isOwnComment && anonymousUsername && !isWelcomePost;
            const voteButtonsDisabled = isOwnComment ? 'disabled style="opacity: 0.5; cursor: not-allowed;"' : '';
            const isPinned = comment.pinned;
            
            const upvoteActive = comment.user_vote === 'upvote' ? 'active' : '';
            const downvoteActive = comment.user_vote === 'downvote' ? 'active' : '';
            
            return `
                <div class="comment ${comment.parent_id ? 'reply' : ''} ${isPinned ? 'pinned-comment' : ''}">
                    <div class="comment-header">
                        <span class="comment-author">${comment.author_uid}</span>
                        <span class="comment-time">${new Date(comment.created_at).toLocaleDateString()}</span>
                        ${isPinned ? '<span class="pin-badge">📌 Pinned</span>' : ''}
                        ${canPin ? `<button class="pin-btn" data-comment-id="${comment.id}" data-type="comment">📌</button>` : ''}
                        ${canDelete ? `<button class="delete-btn" data-comment-id="${comment.id}" data-type="comment">🗑️</button>` : ''}
                        ${canReport ? `<button class="report-btn" data-comment-id="${comment.id}" data-type="comment">🚩</button>` : ''}
                    </div>
                    <p class="comment-content">${comment.content}</p>
                    <div class="comment-actions">
                        <div class="vote-buttons">
                            <button class="vote-btn upvote ${upvoteActive}" data-comment-id="${comment.id}" data-type="upvote" ${voteButtonsDisabled}>▲</button>
                            <span class="vote-count">${voteScore}</span>
                            <button class="vote-btn downvote ${downvoteActive}" data-comment-id="${comment.id}" data-type="downvote" ${voteButtonsDisabled}>▼</button>
                        </div>
                        <button class="reply-btn" data-comment-id="${comment.id}">Reply</button>
                    </div>
                </div>
            `;
        }).join('');
        
        container.querySelectorAll('.vote-btn:not([disabled])').forEach(btn => {
            btn.addEventListener('click', () => {
                voteComment(parseInt(btn.dataset.commentId), btn.dataset.type);
            });
        });
        
        container.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                deleteContent(btn.dataset.type, parseInt(btn.dataset.commentId));
            });
        });
        
        container.querySelectorAll('.reply-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const commentInput = document.getElementById('comment-input');
                if (commentInput) {
                    commentInput.focus();
                    commentInput.placeholder = 'Replying to comment...';
                }
            });
        });
        
        container.querySelectorAll('.pin-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                pinContent(btn.dataset.type, parseInt(btn.dataset.commentId));
            });
        });
        
        container.querySelectorAll('.report-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                showReportModal(btn.dataset.type, parseInt(btn.dataset.commentId));
            });
        });
    }

    async function votePost(postId, voteType) {
        if (!anonymousUsername) {
            alert('Please log in to vote.');
            return;
        }
        
        try {
            const response = await fetch('/api/forum?action=vote', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    postId: parseInt(postId),
                    voteType,
                    voterUid: anonymousUsername
                })
            });
            
            if (response.ok) {
                loadPosts();
                updateAuraDisplay();
            }
        } catch (err) {
            console.error('Vote error:', err);
        }
    }

    async function voteComment(commentId, voteType) {
        if (!anonymousUsername) {
            alert('Please log in to vote.');
            return;
        }
        
        try {
            const response = await fetch('/api/forum?action=vote', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    commentId: parseInt(commentId),
                    voteType,
                    voterUid: anonymousUsername
                })
            });
            
            if (response.ok) {
                loadComments(currentPost.id);
                updateAuraDisplay();
            }
        } catch (err) {
            console.error('Vote error:', err);
        }
    }

    async function deleteContent(type, id) {
        if (!confirm(`Are you sure you want to delete this ${type}?`)) return;
        
        try {
            const response = await fetch('/api/forum?action=delete-content', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    type, 
                    id: parseInt(id), 
                    authorUid: anonymousUsername 
                })
            });
            
            if (response.ok) {
                const result = await response.json();
                if (result.success) {
                    alert(`${type.charAt(0).toUpperCase() + type.slice(1)} deleted successfully!`);
                    
                    if (type === 'post') {
                        if (currentPost && currentPost.id == id) {
                            showScreen('community-screen');
                        }
                        loadPosts();
                    } else if (type === 'comment' && currentPost) {
                        loadComments(currentPost.id);
                    }
                } else {
                    alert(result.error || `Failed to delete ${type}`);
                }
            } else {
                alert(`Failed to delete ${type}`);
            }
        } catch (err) {
            alert('Error deleting content');
        }
    }

    let isCreatingPost = false; // Prevent duplicate submissions
    
    async function createPost(title, content) {
        if (isCreatingPost) {
            return false; // Prevent duplicate submissions
        }
        
        if (!anonymousUsername) {
            alert('Please log in to create posts.');
            return false;
        }
        
        // Check if user is member of community
        const isMember = await checkMembership(currentCommunity);
        if (!isMember) {
            alert('You must join this community to create posts.');
            return false;
        }
        
        // Check community rules agreement
        const rulesAgreed = localStorage.getItem(`rules_agreed_${currentCommunity}_${anonymousUsername}`);
        if (!rulesAgreed) {
            await showCommunityRulesModal(currentCommunity);
            return false;
        }
        
        isCreatingPost = true;
        
        try {
            const response = await fetch('/api/forum?action=posts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title,
                    content,
                    community: currentCommunity,
                    authorUid: anonymousUsername
                })
            });
            
            if (response.ok) {
                await loadPosts();
                updateAuraDisplay();
                return true;
            } else {
                alert('Failed to create post');
                return false;
            }
        } catch (err) {
            alert('Error creating post');
            return false;
        } finally {
            isCreatingPost = false;
        }
    }

    let isCreatingComment = false; // Prevent duplicate submissions
    
    async function createComment(content) {
        if (isCreatingComment) {
            return false; // Prevent duplicate submissions
        }
        
        if (!anonymousUsername || !currentPost) {
            alert('Please log in to comment.');
            return false;
        }
        
        // Check if user is member of community
        const isMember = await checkMembership(currentCommunity);
        if (!isMember) {
            alert('You must join this community to comment.');
            return false;
        }
        
        // Check community rules agreement
        const rulesAgreed = localStorage.getItem(`rules_agreed_${currentCommunity}_${anonymousUsername}`);
        if (!rulesAgreed) {
            await showCommunityRulesModal(currentCommunity);
            return false;
        }
        
        isCreatingComment = true;
        
        try {
            const response = await fetch('/api/forum?action=comments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    content,
                    postId: currentPost.id,
                    authorUid: anonymousUsername
                })
            });
            
            if (response.ok) {
                // Update comment count immediately
                currentPost.comment_count = (currentPost.comment_count || 0) + 1;
                
                // Reload comments to show the new one
                await loadComments(currentPost.id);
                
                // Update comment count in community view if visible
                const commentCountEl = document.querySelector(`[data-post-id="${currentPost.id}"] .comment-count`);
                if (commentCountEl) {
                    commentCountEl.textContent = `${currentPost.comment_count} comments`;
                }
                
                updateAuraDisplay();
                return true;
            } else {
                alert('Failed to create comment');
                return false;
            }
        } catch (err) {
            alert('Error creating comment');
            return false;
        } finally {
            isCreatingComment = false;
        }
    }

    async function openPost(postId) {
        try {
            await new Promise(resolve => setTimeout(resolve, 100)); // Rate limit delay
            const response = await fetch(`/api/forum?action=posts&postId=${postId}&userUid=${encodeURIComponent(anonymousUsername)}`);
            if (response.ok) {
                currentPost = await response.json();
                displayPostDetail();
                await new Promise(resolve => setTimeout(resolve, 200)); // Delay before loading comments
                loadComments(postId);
                showScreen('post-screen');
            }
        } catch (err) {
            console.log('Post detail not available');
        }
    }

    async function initializeForum() {
        try {
            await fetch('/api/forum?action=init', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            });
        } catch (err) {
            console.log('Forum initialization failed:', err);
        }
    }

    // Initialize forum database on first load
    initializeForum();
    
    // Initialize forum database and tables
    async function initializeForumDatabase() {
        try {
            const initResponse = await fetch('/api/forum?action=init', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            });
            if (initResponse.ok) {
                console.log('✅ Forum database initialized');
            }
        } catch (err) {
            console.log('Forum initialization failed:', err);
        }
    }
    
    // Run database initialization
    initializeForumDatabase();

    function updateCommunity(newCommunity) {
        currentCommunity = newCommunity;
        console.log('Community updated to:', currentCommunity);
    }

    async function getUserForumUid() {
        try {
            const currentUser = JSON.parse(localStorage.getItem('currentUser'));
            if (currentUser && currentUser.id) {
                const response = await fetch(`/api/forum?action=user&userId=${currentUser.id}`);
                if (response.ok) {
                    const data = await response.json();
                    if (data.success) {
                        anonymousUsername = data.username;
                        const auraEl = document.getElementById('user-aura');
                        if (auraEl) {
                            auraEl.textContent = data.auraPoints + ' aura';
                        }
                    }
                }
            }
        } catch (err) {
            console.log('Failed to get user forum UID:', err);
        }
    }

    async function updateAuraDisplay() {
        try {
            const currentUser = JSON.parse(localStorage.getItem('currentUser'));
            if (currentUser && currentUser.id) {
                const response = await fetch(`/api/forum?action=user&userId=${currentUser.id}`);
                if (response.ok) {
                    const data = await response.json();
                    if (data.success) {
                        const auraEl = document.getElementById('user-aura');
                        if (auraEl) {
                            auraEl.textContent = data.auraPoints + ' aura';
                        }
                    }
                }
            }
        } catch (err) {
            console.log('Failed to update aura display:', err);
        }
    }

    async function reportContent(type, id, reason) {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (!currentUser || !anonymousUsername) {
            alert('Please log in to report content.');
            return;
        }
        
        try {
            const response = await fetch('/api/forum?action=report', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type,
                    id: parseInt(id),
                    reason,
                    reporterUid: anonymousUsername
                })
            });
            if (response.ok) {
                alert('Report submitted successfully!');
            } else {
                const errorData = await response.text();
                console.error('Report failed:', response.status, errorData);
                alert('Failed to submit report');
            }
        } catch (err) {
            console.error('Report error:', err);
            alert('Error submitting report');
        }
    }

    async function pinContent(type, id) {
        try {
            const body = type === 'post' ? { postId: parseInt(id), pinnerUid: anonymousUsername } : { commentId: parseInt(id), pinnerUid: anonymousUsername };
            const response = await fetch('/api/forum?action=pin', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });
            if (response.ok) {
                const result = await response.json();
                if (result.success) {
                    alert(`${type} ${result.pinned ? 'pinned' : 'unpinned'} successfully!`);
                    if (type === 'post') {
                        loadPosts();
                    } else {
                        loadComments(currentPost.id);
                    }
                }
            }
        } catch (err) {
            alert('Error pinning content');
        }
    }

    async function joinCommunity(community) {
        if (!anonymousUsername) {
            alert('Please log in to join communities.');
            return false;
        }
        
        try {
            const response = await fetch('/api/forum?action=join', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    community,
                    userUid: anonymousUsername,
                    action: 'join'
                })
            });
            return response.ok;
        } catch (err) {
            console.error('Join community error:', err);
            return false;
        }
    }
    
    async function leaveCommunity(community) {
        if (!anonymousUsername) return false;
        
        try {
            const response = await fetch('/api/forum?action=join', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    community,
                    userUid: anonymousUsername,
                    action: 'leave'
                })
            });
            return response.ok;
        } catch (err) {
            console.error('Leave community error:', err);
            return false;
        }
    }
    
    async function checkMembership(community) {
        if (!anonymousUsername) return false;
        
        try {
            const response = await fetch(`/api/forum?action=memberships&userUid=${encodeURIComponent(anonymousUsername)}`);
            if (response.ok) {
                const data = await response.json();
                return data.success && data.memberships.includes(community);
            }
        } catch (err) {
            console.error('Check membership error:', err);
        }
        return false;
    }

    function showReportModal(type, id) {
        window.currentReportType = type;
        window.currentReportId = id;
        document.getElementById('report-modal').classList.add('active');
    }
    
    async function getCommunityRules(community) {
        try {
            const response = await fetch(`/api/forum?action=community-rules&community=${community}`);
            if (response.ok) {
                const data = await response.json();
                return data.success ? data.rules : 'No rules available.';
            }
        } catch (err) {
            console.error('Error fetching community rules:', err);
        }
        return 'No rules available.';
    }
    
    async function showCommunityRulesModal(community) {
        const rules = await getCommunityRules(community);
        const modal = document.getElementById('community-rules-modal');
        if (modal) {
            document.getElementById('community-rules-text').textContent = rules;
            document.getElementById('community-rules-title').textContent = `c/${community} Community Rules`;
            modal.classList.add('active');
        }
    }
    
    function checkCommunityRulesAgreement() {
        const checkbox = document.getElementById('rules-agreement-checkbox');
        const submitBtn = document.getElementById('submit-post-btn');
        const commentBtn = document.getElementById('submit-comment-btn');
        
        if (checkbox && checkbox.checked) {
            if (submitBtn) submitBtn.disabled = false;
            if (commentBtn) commentBtn.disabled = false;
            return true;
        } else {
            if (submitBtn) submitBtn.disabled = true;
            if (commentBtn) commentBtn.disabled = true;
            return false;
        }
    }
    
    // Vote functions
    const userVotes = {};
    
    async function votePost(postId, voteType) {
        if (!anonymousUsername) {
            alert('Please refresh the page and try again.');
            return;
        }
        
        const currentVote = userVotes[`post-${postId}`];
        const voteCountEl = document.querySelector(`[data-post-id="${postId}"] .vote-count`);
        const upBtn = document.querySelector(`[data-post-id="${postId}"] .upvote`);
        const downBtn = document.querySelector(`[data-post-id="${postId}"] .downvote`);
        
        if (!voteCountEl) return;
        
        let currentCount = parseInt(voteCountEl.textContent) || 0;
        let newVote = null;
        
        if (currentVote === voteType) {
            currentCount += voteType === 'upvote' ? -1 : 1;
            newVote = null;
        } else {
            if (currentVote) {
                currentCount += voteType === 'upvote' ? 2 : -2;
            } else {
                currentCount += voteType === 'upvote' ? 1 : -1;
            }
            newVote = voteType;
        }
        
        voteCountEl.textContent = currentCount;
        userVotes[`post-${postId}`] = newVote;
        
        if (upBtn) upBtn.classList.toggle('active', newVote === 'upvote');
        if (downBtn) downBtn.classList.toggle('active', newVote === 'downvote');
        
        fetch('/api/forum?action=vote', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                postId: parseInt(postId), 
                voteType, 
                voterUid: anonymousUsername 
            })
        }).catch(() => {});
    }

    async function voteComment(commentId, voteType) {
        if (!anonymousUsername) {
            alert('Please refresh the page and try again.');
            return;
        }
        
        const currentVote = userVotes[`comment-${commentId}`];
        const voteCountEl = document.querySelector(`[data-comment-id="${commentId}"] .vote-count`);
        const upBtn = document.querySelector(`[data-comment-id="${commentId}"] .upvote`);
        const downBtn = document.querySelector(`[data-comment-id="${commentId}"] .downvote`);
        
        if (!voteCountEl) return;
        
        let currentCount = parseInt(voteCountEl.textContent) || 0;
        let newVote = null;
        
        if (currentVote === voteType) {
            currentCount += voteType === 'upvote' ? -1 : 1;
            newVote = null;
        } else {
            if (currentVote) {
                currentCount += voteType === 'upvote' ? 2 : -2;
            } else {
                currentCount += voteType === 'upvote' ? 1 : -1;
            }
            newVote = voteType;
        }
        
        voteCountEl.textContent = currentCount;
        userVotes[`comment-${commentId}`] = newVote;
        
        if (upBtn) upBtn.classList.toggle('active', newVote === 'upvote');
        if (downBtn) downBtn.classList.toggle('active', newVote === 'downvote');
        
        fetch('/api/forum?action=vote', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                commentId: parseInt(commentId), 
                voteType, 
                voterUid: anonymousUsername 
            })
        }).catch(() => {});
    }

    async function deleteContent(type, id) {
        if (!confirm(`Are you sure you want to delete this ${type}?`)) return;
        
        try {
            const response = await fetch('/api/forum?action=delete-content', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    type, 
                    id: parseInt(id), 
                    authorUid: anonymousUsername 
                })
            });
            
            if (response.ok) {
                const result = await response.json();
                if (result.success) {
                    alert(`${type} deleted successfully!`);
                    if (type === 'post') {
                        loadPosts();
                    } else if (type === 'comment' && currentPost) {
                        loadComments(currentPost.id);
                    }
                }
            }
        } catch (err) {
            alert('Error deleting content');
        }
    }

    window.showReportModal = showReportModal;

    return {
        loadPosts,
        displayPosts,
        openPost,
        displayPostDetail,
        loadComments,
        displayComments,
        votePost,
        voteComment,
        deleteContent,
        createPost,
        createComment,
        initializeForum,
        updateCommunity,
        updateAuraDisplay,
        reportContent,
        pinContent,
        joinCommunity,
        leaveCommunity,
        checkMembership,
        showReportModal,
        getCommunityRules,
        showCommunityRulesModal,
        checkCommunityRulesAgreement,
        samplePosts,
        sampleComments
    };
}

window.initializeForum = initializeForum;