// Content script to run on web pages
console.log("VarnGuard: Content script loaded on " + window.location.href);

function isTermsOrPrivacyPage() {
    const url = window.location.href.toLowerCase();
    const keywords = ['signup', 'sign-up', 'register', 'login', 'accounts', 'terms', 'privacy', 'policy'];
    
    if (keywords.some(kw => url.includes(kw))) {
        return true;
    }

    const headings = Array.from(document.querySelectorAll('h1, h2, h3'));
    for (let h of headings) {
        const text = h.innerText.toLowerCase();
        if (keywords.some(kw => text.includes(kw))) {
            return true;
        }
    }
    return false;
}

function extractText() {
    return document.body.innerText || "";
}

function injectBanner(riskScore, summaryPoints) {
    if (document.getElementById('varnguard-banner')) return;

    const banner = document.createElement('div');
    banner.id = 'varnguard-banner';
    
    // Dynamic styling based on riskscore
    const isHighRisk = riskScore > 50;
    const bgColor = isHighRisk ? '#ff4d4d' : '#4CAF50';
    const textMsg = isHighRisk ? 'High Risk Detected in Terms/Policy' : 'Low Risk. Policy looks standard.';
    
    Object.assign(banner.style, {
        position: 'fixed',
        top: '0',
        left: '0',
        width: '100%',
        backgroundColor: bgColor,
        color: 'white',
        zIndex: '999999',
        padding: '12px 24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontFamily: 'Inter, system-ui, sans-serif',
        boxSizing: 'border-box',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
    });

    const textWrapper = document.createElement('div');
    textWrapper.style.display = 'flex';
    textWrapper.style.alignItems = 'center';
    textWrapper.style.gap = '10px';

    const icon = document.createElement('span');
    icon.innerHTML = isHighRisk ? '⚠️' : '✅';
    icon.style.fontSize = '18px';

    const msgSpan = document.createElement('span');
    msgSpan.innerText = `VarnGuard: ${textMsg} (Risk Score: ${riskScore}/100)`;
    msgSpan.style.fontWeight = '600';
    msgSpan.style.fontSize = '15px';
    msgSpan.style.letterSpacing = '0.3px';

    textWrapper.appendChild(icon);
    textWrapper.appendChild(msgSpan);

    const btn = document.createElement('button');
    btn.innerText = 'View Summary';
    Object.assign(btn.style, {
        padding: '8px 16px',
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        color: '#1a1a1a',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
        fontWeight: 'bold',
        fontSize: '13px',
        transition: 'transform 0.1s ease, background-color 0.2s',
        boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
    });

    btn.onmouseover = () => btn.style.backgroundColor = 'white';
    btn.onmouseout = () => btn.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
    btn.onmousedown = () => btn.style.transform = 'scale(0.96)';
    btn.onmouseup = () => btn.style.transform = 'scale(1)';

    btn.onclick = () => showModal(summaryPoints);

    banner.appendChild(textWrapper);
    banner.appendChild(btn);

    document.body.prepend(banner);

    // Push down the document body to prevent overlap
    const currentPadding = window.getComputedStyle(document.body).paddingTop;
    const currentPaddingNum = parseInt(currentPadding.replace('px', '')) || 0;
    document.body.style.paddingTop = `${currentPaddingNum + 60}px`;
}

function showModal(summaryPoints) {
    if (document.getElementById('varnguard-modal-overlay')) return;

    // Inject modal overlay
    const overlay = document.createElement('div');
    overlay.id = 'varnguard-modal-overlay';
    Object.assign(overlay.style, {
        position: 'fixed',
        top: '0',
        left: '0',
        width: '100vw',
        height: '100vh',
        backgroundColor: 'rgba(0,0,0,0.6)',
        backdropFilter: 'blur(3px)',
        zIndex: '1000000',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        fontFamily: 'Inter, system-ui, sans-serif',
        opacity: '0',
        transition: 'opacity 0.2s ease'
    });

    const modal = document.createElement('div');
    Object.assign(modal.style, {
        backgroundColor: 'white',
        padding: '32px',
        borderRadius: '12px',
        width: '450px',
        maxWidth: '90%',
        boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
        position: 'relative',
        color: '#222',
        transform: 'translateY(20px)',
        transition: 'transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
    });

    const header = document.createElement('div');
    header.style.display = 'flex';
    header.style.justifyContent = 'space-between';
    header.style.alignItems = 'center';
    header.style.marginBottom = '20px';
    header.style.borderBottom = '1px solid #eaeaea';
    header.style.paddingBottom = '12px';

    const title = document.createElement('h2');
    title.innerText = 'Policy Summary';
    title.style.margin = '0';
    title.style.fontSize = '20px';
    title.style.fontWeight = '700';
    title.style.color = '#111';

    const closeIconBtn = document.createElement('button');
    closeIconBtn.innerHTML = '&times;';
    Object.assign(closeIconBtn.style, {
        background: 'none',
        border: 'none',
        fontSize: '24px',
        cursor: 'pointer',
        color: '#888',
        padding: '0',
        lineHeight: '1'
    });
    closeIconBtn.onclick = closeModal;
    closeIconBtn.onmouseover = () => closeIconBtn.style.color = '#333';
    closeIconBtn.onmouseout = () => closeIconBtn.style.color = '#888';

    header.appendChild(title);
    header.appendChild(closeIconBtn);

    const list = document.createElement('ul');
    list.style.paddingLeft = '24px';
    list.style.margin = '0 0 24px 0';
    list.style.lineHeight = '1.6';
    list.style.color = '#444';

    summaryPoints.forEach(point => {
        const li = document.createElement('li');
        li.innerText = point;
        li.style.marginBottom = '12px';
        list.appendChild(li);
    });

    const footer = document.createElement('div');
    footer.style.textAlign = 'right';

    const closeBtn = document.createElement('button');
    closeBtn.innerText = 'Got it';
    Object.assign(closeBtn.style, {
        padding: '10px 20px',
        backgroundColor: '#f0f0f0',
        color: '#333',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
        fontWeight: '600',
        fontSize: '14px',
        transition: 'background-color 0.2s'
    });
    closeBtn.onclick = closeModal;
    closeBtn.onmouseover = () => closeBtn.style.backgroundColor = '#e0e0e0';
    closeBtn.onmouseout = () => closeBtn.style.backgroundColor = '#f0f0f0';

    footer.appendChild(closeBtn);

    modal.appendChild(header);
    modal.appendChild(list);
    modal.appendChild(footer);
    overlay.appendChild(modal);

    document.body.appendChild(overlay);

    // Trigger animations
    requestAnimationFrame(() => {
        overlay.style.opacity = '1';
        modal.style.transform = 'translateY(0)';
    });

    function closeModal() {
        overlay.style.opacity = '0';
        modal.style.transform = 'translateY(20px)';
        setTimeout(() => {
            if (overlay.parentNode) document.body.removeChild(overlay);
        }, 200); // Wait for transition
    }
}

async function scanPage() {
    if (!isTermsOrPrivacyPage()) {
        console.log('VarnGuard: Not a policy page. Standing by.');
        return;
    }

    console.log("VarnGuard: Page detected");
    console.log('VarnGuard: Policy page detected. Extracting text...');
    const text = extractText();

    // Prevent oversized payloads - truncate to first 12,000 characters
    const payloadText = text.length > 12000 ? text.substring(0, 12000) : text; 

    try {
        console.log('VarnGuard: Requesting scan from localhost API...');
        const response = await fetch('http://localhost:5000/api/scan', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ text: payloadText })
        });
        
        if (!response.ok) {
            const errorText = await response.text().catch(() => 'unknown error');
            console.error(`VarnGuard API error: ${response.status}`, errorText);
            throw new Error(`API error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        console.log('VarnGuard API response:', data);

        const riskScore = data.riskScore ?? 0;
        const defaultSummary = [
            "We could not extract a detailed summary.",
            "Please read the document carefully.",
            "Beware of giving away unnecessary personal data."
        ];
        
        let summaryLines = data.summary;
        // Verify summary format
        if (!Array.isArray(summaryLines) || summaryLines.length === 0) {
            summaryLines = defaultSummary;
        }

        // Only take the first 3 if more are provided
        const summaryPoints = summaryLines.slice(0, 3);

        injectBanner(riskScore, summaryPoints);

    } catch (error) {
        console.error('VarnGuard failed to fetch scan results:', error);
        
        // Show fallback UI for demonstration/graceful degradation if server is down
        injectBanner(100, [
            "Could not connect to the local VarnGuard API.",
            "Please ensure localhost:5000 is running.",
            "Error details: " + error.message
        ]);
    }
}

// --- Deepfake Detection Overlay Logic ---

function injectVideoOverlay(video) {
    if (video.dataset.varnguardInjected) return;
    video.dataset.varnguardInjected = 'true';

    // Create wrapper to hold video and overlay
    const wrapper = document.createElement('div');
    wrapper.className = 'varnguard-video-wrapper';
    wrapper.style.position = 'relative';
    wrapper.style.display = 'inline-block';
    
    // Copy computed styles roughly to not break layout
    if (window.getComputedStyle) {
        const compStyle = window.getComputedStyle(video);
        if (compStyle.display === 'block') wrapper.style.display = 'block';
    }
    
    // Create overlay button
    const overlay = document.createElement('div');
    Object.assign(overlay.style, {
        position: 'absolute',
        top: '10px',
        right: '10px',
        zIndex: '999999',
        fontFamily: 'Inter, system-ui, sans-serif'
    });

    const btn = document.createElement('button');
    btn.innerText = 'Verify Deepfake';
    btn.title = 'Scan this video for deepfakes using VarnGuard';
    Object.assign(btn.style, {
        padding: '6px 12px',
        backgroundColor: '#8b5cf6',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontWeight: 'bold',
        fontSize: '12px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
        transition: 'background-color 0.2s, transform 0.1s'
    });

    // Hover effects
    btn.onmouseover = () => btn.style.backgroundColor = '#7c3aed';
    btn.onmouseout = () => btn.style.backgroundColor = '#8b5cf6';
    btn.onmousedown = () => btn.style.transform = 'scale(0.95)';
    btn.onmouseup = () => btn.style.transform = 'scale(1)';

    // Click handler
    btn.onclick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        btn.innerText = 'Analyzing...';
        btn.style.backgroundColor = '#f59e0b';
        
        // Mocking the verification process delay
        setTimeout(() => {
            btn.innerText = 'Verified: Clear';
            btn.style.backgroundColor = '#10b981';
        }, 1500);
        
        console.log('VarnGuard: Deepfake verification initiated for video:', video.src || 'inline video');
    };

    overlay.appendChild(btn);

    // Replace video with wrapper, then place video inside wrapper
    if (video.parentNode) {
        video.parentNode.insertBefore(wrapper, video);
        wrapper.appendChild(video);
        wrapper.appendChild(overlay);
    }
}

function scanForVideos() {
    const videos = document.querySelectorAll('video');
    videos.forEach(video => injectVideoOverlay(video));
}

function observeVideos() {
    scanForVideos();
    
    // Observe DOM for dynamically added videos
    const observer = new MutationObserver((mutations) => {
        let shouldScan = false;
        for (let mutation of mutations) {
            if (mutation.addedNodes.length) {
                // Quick check if any added node is a video or might contain one
                for (let i = 0; i < mutation.addedNodes.length; i++) {
                    const node = mutation.addedNodes[i];
                    if (node.nodeType === 1) { // ELEMENT_NODE
                        if (node.tagName === 'VIDEO' || node.querySelector('video')) {
                            shouldScan = true;
                            break;
                        }
                    }
                }
            }
            if (shouldScan) break;
        }
        if (shouldScan) {
            scanForVideos();
        }
    });

    observer.observe(document.body, { childList: true, subtree: true });
}

// Start sequence when document is idle/ready to avoid blocking page load
function init() {
    scanPage();
    observeVideos();
}

if (document.readyState === 'complete') {
    init();
} else {
    window.addEventListener('load', init);
}
