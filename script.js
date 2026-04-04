const CLIPSHARE_BASE_URL = 'https://underroot.io/asd/';

document.addEventListener('DOMContentLoaded', () => {

    function setLoading(btn, isLoading) {
        const loader = btn.querySelector('.btn-loader');
        const text = btn.querySelector('.btn-text');
        btn.disabled = isLoading;
        if (loader) loader.classList.toggle('hidden', !isLoading);
        if (text) text.style.opacity = isLoading ? '0.5' : '1';
    }

    function showInlineError(el, msg) {
        el.textContent = msg;
        el.classList.remove('hidden');
    }

    function hideInlineError(el) {
        el.textContent = '';
        el.classList.add('hidden');
    }

    function showErrorModal(msg) {
        document.getElementById('errorModalMsg').textContent = msg;
        document.getElementById('errorModal').classList.remove('hidden');
    }

    function formatRemaining(seconds) {
        if (seconds === null || seconds === undefined) return null;
        if (seconds <= 0) return 'Expired';
        const d = Math.floor(seconds / 86400);
        const h = Math.floor((seconds % 86400) / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        if (d > 0) return ${d}d ${h}h remaining;
        if (h > 0) return ${h}h ${m}m remaining;
        return ${m}m remaining;
    }

    function buildMetaBar(accessCount, expiryRemaining, oneTime) {
        const parts = [];

        if (accessCount !== undefined && accessCount !== null) {
            parts.push(`
                <span class="meta-pill meta-access">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    ${accessCount} ${accessCount === 1 ? 'access' : 'accesses'}
                </span>`);
        }

        if (expiryRemaining !== null && expiryRemaining !== undefined) {
            const label = formatRemaining(expiryRemaining);
            const cls = expiryRemaining < 3600 ? 'meta-expiry meta-expiry-soon' : 'meta-expiry';
            parts.push(`
                <span class="meta-pill ${cls}">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                    ${label}
                </span>`);
        } else if (expiryRemaining === null) {
            parts.push(`
                <span class="meta-pill meta-never">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                    Never expires
                </span>`);
        }

        if (oneTime) {
            parts.push(`
                <span class="meta-pill meta-onetime">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
                    One-time
                </span>`);
        }

        return parts.join('');
    }

    function getFileIcon(filename) {
        const ext = filename.split('.').pop().toLowerCase();
        const icons = {
            pdf: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="1.5"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><polyline points="13 2 13 9 20 9"/><line x1="9" y1="13" x2="15" y2="13"/><line x1="9" y1="17" x2="15" y2="17"/></svg>,
            mp4: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" stroke-width="1.5"><rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"/><line x1="7" y1="2" x2="7" y2="22"/><line x1="17" y1="2" x2="17" y2="22"/><line x1="2" y1="12" x2="22" y2="12"/><line x1="2" y1="7" x2="7" y2="7"/><line x1="2" y1="17" x2="7" y2="17"/><line x1="17" y1="17" x2="22" y2="17"/><line x1="17" y1="7" x2="22" y2="7"/></svg>,
            mov: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" stroke-width="1.5"><rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"/></svg>,
            doc: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="1.5"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><polyline points="13 2 13 9 20 9"/></svg>,
            docx: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="1.5"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><polyline points="13 2 13 9 20 9"/></svg>,
            txt: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#64748b" stroke-width="1.5"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><polyline points="13 2 13 9 20 9"/><line x1="9" y1="13" x2="15" y2="13"/><line x1="9" y1="17" x2="15" y2="17"/></svg>,
            jpg: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>,
            jpeg: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>,
            png: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>,
            gif: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/></svg>,
            webp: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/></svg>,
        };
        return icons[ext] || <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#64748b" stroke-width="1.5"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><polyline points="13 2 13 9 20 9"/></svg>;
    }

    function formatBytes(bytes) {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / 1048576).toFixed(1) + ' MB';
    }

    const errorModal = document.getElementById('errorModal');
    const errorModalClose = document.getElementById('errorModalClose');
    errorModalClose.addEventListener('click', () => errorModal.classList.add('hidden'));
    errorModal.addEventListener('click', (e) => {
        if (e.target === errorModal) errorModal.classList.add('hidden');
    });

    const mainTabBtns     = document.querySelectorAll('.main-tab-btn');
    const mainTabContents = document.querySelectorAll('.tab-content');
    let currentMainIdx = 0;

    mainTabBtns.forEach((btn, idx) => {
        btn.addEventListener('click', (e) => {
            if (btn.classList.contains('active')) return;

            const goRight = idx > currentMainIdx;
            currentMainIdx = idx;

            const r = btn.getBoundingClientRect();
            burstParticles(r.left + r.width / 2, r.top + r.height / 2, 14);

            mainTabBtns.forEach(b => {
                b.classList.remove('active');
                b.setAttribute('aria-selected', 'false');
            });
            btn.classList.add('active');
            btn.setAttribute('aria-selected', 'true');

            mainTabContents.forEach(c => c.classList.add('hidden'));
            const target = document.getElementById(btn.dataset.target);
            target.classList.remove('hidden');

            target.classList.remove('slide-in-right', 'slide-in-left');
            void target.offsetWidth;
            target.classList.add(goRight ? 'slide-in-right' : 'slide-in-left');
            target.addEventListener('animationend', () => {
                target.classList.remove('slide-in-right', 'slide-in-left');
            }, { once: true });
        });
    });

    const innerTabBtns     = document.querySelectorAll('.inner-tab-btn');
    const innerTabContents = document.querySelectorAll('.inner-tab-content');

    innerTabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            if (btn.classList.contains('active')) return;
            innerTabBtns.forEach(b => { b.classList.remove('active'); b.setAttribute('aria-selected', 'false'); });
            innerTabContents.forEach(c => c.classList.add('hidden'));
            btn.classList.add('active');
            btn.setAttribute('aria-selected', 'true');
            document.getElementById(btn.dataset.target).classList.remove('hidden');
        });
    });

    const shareTextForm = document.getElementById('shareTextForm');
    const shareTextArea = document.getElementById('shareTextArea');
    const shareTextBtn = document.getElementById('shareTextBtn');
    const shareTextResult = document.getElementById('shareTextResult');
    const shareTextError = document.getElementById('shareTextError');
    const generatedTextKey = document.getElementById('generatedTextKey');
    const copyTextKeyBtn = document.getElementById('copyTextKeyBtn');
    const copyTextKeyMsg = document.getElementById('copyTextKeyMsg');
    const shareTextMeta = document.getElementById('shareTextMeta');
    const textExpiry = document.getElementById('textExpiry');
    const textOneTime = document.getElementById('textOneTime');

    shareTextForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const text = shareTextArea.value.trim();
        if (!text) return;

        hideInlineError(shareTextError);
        shareTextResult.classList.add('hidden');
        setLoading(shareTextBtn, true);

        try {
            const fd = new FormData();
            fd.append('action', 'store_text');
            fd.append('text', text);
            fd.append('expiry', textExpiry.value);
            fd.append('one_time', textOneTime.checked ? '1' : '0');

            const res = await fetch('api.php', { method: 'POST', body: fd });
            const data = await res.json();

            if (data.success) {
                generatedTextKey.textContent = data.key;
                shareTextMeta.innerHTML = buildMetaBar(
                    null,
                    textExpiry.value === 'never' ? null : getExpirySecondsFromValue(textExpiry.value),
                    textOneTime.checked
                );
                shareTextResult.classList.remove('hidden');
                shareTextArea.value = '';
                // ── QR Code ──────────────────────────────────────
                generateQR('textQrContainer', data.key);
                wireQrActions('textDownloadQrBtn', 'textCopyLinkBtn', 'textCopyLinkMsg', data.key);
            } else {
                if (res.status === 429) {
                    showErrorModal(data.error || 'Rate limit exceeded.');
                } else {
                    showInlineError(shareTextError, data.error || 'Failed to share text.');
                }
            }
        } catch {
            showInlineError(shareTextError, 'Network error. Please check your connection.');
        } finally {
            setLoading(shareTextBtn, false);
        }
    });

    copyTextKeyBtn.addEventListener('click', () => {
        navigator.clipboard.writeText(generatedTextKey.textContent).then(() => {
            copyTextKeyMsg.classList.remove('hidden');
            setTimeout(() => copyTextKeyMsg.classList.add('hidden'), 2000);
        });
    });

    function getExpirySecondsFromValue(val) {
        const map = { '1h': 3600, '24h': 86400, '7d': 604800 };
        return map[val] ?? null;
    }

    const shareFileForm = document.getElementById('shareFileForm');
    const shareFileBtn = document.getElementById('shareFileBtn');
    const shareFileResult = document.getElementById('shareFileResult');
    const shareFileError = document.getElementById('shareFileError');
    const generatedFileKey = document.getElementById('generatedFileKey');
    const copyFileKeyBtn = document.getElementById('copyFileKeyBtn');
    const copyFileKeyMsg = document.getElementById('copyFileKeyMsg');
    const shareFileMeta = document.getElementById('shareFileMeta');

    const dropZone = document.getElementById('dropZone');
    const fileInput = document.getElementById('fileInput');
    const filePreview = document.getElementById('filePreview');
    const filePreviewName = document.getElementById('filePreviewName');
    const filePreviewSize = document.getElementById('filePreviewSize');
    const filePreviewIcon = document.getElementById('filePreviewIcon');
    const fileRemoveBtn = document.getElementById('fileRemoveBtn');
    const dropZoneText = document.getElementById('dropZoneText');
    const dropZoneHint = document.getElementById('dropZoneHint');
    const uploadProgress = document.getElementById('uploadProgress');
    const progressBarFill = document.getElementById('progressBarFill');
    const progressLabel = document.getElementById('progressLabel');
    const fileExpiry = document.getElementById('fileExpiry');
    const fileOneTime = document.getElementById('fileOneTime');

    const BLOCKED_EXT_CLIENT = ['php', 'php3', 'php4', 'php5', 'phtml', 'js', 'html', 'htm',
        'exe', 'sh', 'bat', 'cmd', 'py', 'rb', 'pl', 'cgi', 'asp', 'aspx', 'jar', 'msi', 'vbs'];

    function showFilePreview(file) {
        filePreviewName.textContent = file.name;
        filePreviewSize.textContent = formatBytes(file.size);
        filePreviewIcon.innerHTML = getFileIcon(file.name);
        filePreview.classList.remove('hidden');
        dropZoneText.innerHTML = '<strong>File selected</strong> — change it by dropping another';
        dropZoneHint.textContent = '';
    }

    function clearFilePreview() {
        fileInput.value = '';
        filePreview.classList.add('hidden');
        dropZoneText.innerHTML = '<strong>Drop a file here</strong> or <span class="link-text">click to browse</span>';
        dropZoneHint.textContent = 'Images, PDF, MP4, DOC, DOCX, TXT • Max 20 MB';
    }

    fileInput.addEventListener('click', (e) => e.stopPropagation());

    dropZone.addEventListener('click', (e) => {

        if (e.target === fileInput) return;
        fileInput.click();
    });
    dropZone.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fileInput.click(); }
    });

    fileInput.addEventListener('change', () => {
        if (fileInput.files.length) showFilePreview(fileInput.files[0]);
    });

    fileRemoveBtn.addEventListener('click', (e) => { e.stopPropagation(); clearFilePreview(); });

    dropZone.addEventListener('dragover', (e) => { e.preventDefault(); dropZone.classList.add('drag-over'); });
    dropZone.addEventListener('dragleave', () => dropZone.classList.remove('drag-over'));
    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('drag-over');
        const files = e.dataTransfer.files;
        if (files.length) {

            const dt = new DataTransfer();
            dt.items.add(files[0]);
            fileInput.files = dt.files;
            showFilePreview(files[0]);
        }
    });

    shareFileForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        hideInlineError(shareFileError);
        shareFileResult.classList.add('hidden');

        if (!fileInput.files.length) {
            showInlineError(shareFileError, 'Please select a file to upload.');
            return;
        }

        const file = fileInput.files[0];
        const ext = file.name.split('.').pop().toLowerCase();

        if (BLOCKED_EXT_CLIENT.includes(ext)) {
            showInlineError(shareFileError, File type .${ext} is not allowed.);
            return;
        }

        if (file.size > 20 * 1024 * 1024) {
            showInlineError(shareFileError, 'File exceeds 20 MB limit.');
            return;
        }

        setLoading(shareFileBtn, true);
        uploadProgress.classList.remove('hidden');
        progressBarFill.style.width = '0%';
        progressLabel.textContent = 'Uploading…';

        try {
            const fd = new FormData();
            fd.append('action', 'store_file');
            fd.append('file', file);
            fd.append('expiry', fileExpiry.value);
            fd.append('one_time', fileOneTime.checked ? '1' : '0');

            await new Promise((resolve, reject) => {
                const xhr = new XMLHttpRequest();
                xhr.open('POST', 'api.php');

                xhr.upload.addEventListener('progress', (ev) => {
                    if (ev.lengthComputable) {
                        const pct = Math.round((ev.loaded / ev.total) * 100);
                        progressBarFill.style.width = pct + '%';
                        progressLabel.textContent = Uploading… ${pct}%;
                    }
                });

                xhr.addEventListener('load', () => {
                    progressBarFill.style.width = '100%';
                    progressLabel.textContent = 'Processing…';

                    try {
                        const data = JSON.parse(xhr.responseText);
                        if (data.success) {
                            generatedFileKey.textContent = data.key;
                            shareFileMeta.innerHTML = buildMetaBar(
                                null,
                                fileExpiry.value === 'never' ? null : getExpirySecondsFromValue(fileExpiry.value),
                                fileOneTime.checked
                            );
                            shareFileResult.classList.remove('hidden');
                            clearFilePreview();

                            generateQR('fileQrContainer', data.key);
                            wireQrActions('fileDownloadQrBtn', 'fileCopyLinkBtn', 'fileCopyLinkMsg', data.key);
                        } else {
                            if (xhr.status === 429) {
                                showErrorModal(data.error || 'Rate limit exceeded.');
                            } else {
                                showInlineError(shareFileError, data.error || 'Upload failed.');
                            }
                        }
                    } catch {
                        showInlineError(shareFileError, 'Server returned an unexpected response.');
                    }
                    resolve();
                });

                xhr.addEventListener('error', () => {
                    reject(new Error('Network error during upload.'));
                });

                xhr.send(fd);
            });

        } catch (err) {
            showInlineError(shareFileError, err.message || 'Upload failed. Please try again.');
        } finally {
            setLoading(shareFileBtn, false);
            setTimeout(() => uploadProgress.classList.add('hidden'), 1200);
        }
    });

    copyFileKeyBtn.addEventListener('click', () => {
        navigator.clipboard.writeText(generatedFileKey.textContent).then(() => {
            copyFileKeyMsg.classList.remove('hidden');
            setTimeout(() => copyFileKeyMsg.classList.add('hidden'), 2000);
        });
    });

    const retrieveForm = document.getElementById('retrieveForm');
    const retrieveKeyInput = document.getElementById('retrieveKeyInput');
    const retrieveSubmitBtn = document.getElementById('retrieveSubmitBtn');
    const retrieveTextResult = document.getElementById('retrieveTextResult');
    const retrieveFileResult = document.getElementById('retrieveFileResult');
    const retrieveError = document.getElementById('retrieveError');
    const retrievedTextArea = document.getElementById('retrievedTextArea');
    const copyRetrievedTextBtn = document.getElementById('copyRetrievedTextBtn');
    const textCopySuccessMsg = document.getElementById('textCopySuccessMsg');
    const retrieveMetaBar = document.getElementById('retrieveMetaBar');
    const retrieveFileMetaBar = document.getElementById('retrieveFileMetaBar');
    const retrieveFileName = document.getElementById('retrieveFileName');
    const retrieveFileType = document.getElementById('retrieveFileType');
    const retrieveFileIcon = document.getElementById('retrieveFileIcon');
    const retrieveDownloadBtn = document.getElementById('retrieveDownloadBtn');

    retrieveKeyInput.addEventListener('input', (e) => {
        e.target.value = e.target.value.replace(/\D/g, '').substring(0, 7);
    });

    retrieveForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const key = retrieveKeyInput.value.trim();
        if (key.length !== 7) {
            showInlineError(retrieveError, 'Please enter a valid 7-digit key.');
            return;
        }

        hideInlineError(retrieveError);
        retrieveTextResult.classList.add('hidden');
        retrieveFileResult.classList.add('hidden');
        setLoading(retrieveSubmitBtn, true);

        try {
            const fd = new FormData();
            fd.append('action', 'retrieve');
            fd.append('key', key);

            const res = await fetch('api.php', { method: 'POST', body: fd });
            const data = await res.json();

            if (data.success) {
                const metaHtml = buildMetaBar(data.access_count, data.expiry_remaining, data.one_time);

                if (data.type === 'text') {
                    retrieveMetaBar.innerHTML = metaHtml;
                    retrievedTextArea.value = data.content;
                    retrievedTextArea.style.height = 'auto';
                    retrievedTextArea.style.height = Math.min(retrievedTextArea.scrollHeight, 400) + 'px';
                    retrieveTextResult.classList.remove('hidden');

                } else if (data.type === 'file') {
                    retrieveFileMetaBar.innerHTML = metaHtml;
                    retrieveFileName.textContent = data.file_name;

                    const ext = data.file_name.split('.').pop().toLowerCase();
                    retrieveFileType.textContent = ext.toUpperCase() + ' file';
                    retrieveFileIcon.innerHTML = getFileIcon(data.file_name);

                    // Set download link
                    retrieveDownloadBtn.href = data.file_path;
                    retrieveDownloadBtn.download = data.file_name;

                    retrieveFileResult.classList.remove('hidden');
                }
            } else {
                if (res.status === 429) {
                    showErrorModal(data.error || 'Rate limit exceeded.');
                } else {
                    showInlineError(retrieveError, data.error || 'Key not found.');
                }
            }
        } catch {
            showInlineError(retrieveError, 'Network error. Please check your connection.');
        } finally {
            setLoading(retrieveSubmitBtn, false);
        }
    });

    copyRetrievedTextBtn.addEventListener('click', () => {
        navigator.clipboard.writeText(retrievedTextArea.value).then(() => {
            textCopySuccessMsg.classList.remove('hidden');
            setTimeout(() => textCopySuccessMsg.classList.add('hidden'), 2000);
        });
    });

    function burstParticles(cx, cy, count = 12) {
        const colors = ['#007236', '#00a94f', '#34d399', '#6ee7b7', '#ffffff'];
        for (let i = 0; i < count; i++) {
            const p   = document.createElement('div');
            p.className = 'tab-particle';
            const angle = (i / count) * Math.PI * 2 + (Math.random() - 0.5) * 0.5;
            const dist  = 28 + Math.random() * 52;
            const size  = 5 + Math.random() * 7;
            const color = colors[Math.floor(Math.random() * colors.length)];
            const dur   = (0.45 + Math.random() * 0.35).toFixed(2);
            p.style.cssText = `
                left:${cx}px; top:${cy}px;
                width:${size}px; height:${size}px;
                background:${color};
                --tx:${(Math.cos(angle) * dist).toFixed(1)}px;
                --ty:${(Math.sin(angle) * dist).toFixed(1)}px;
                --p-dur:${dur}s;
                margin-left:-${size/2}px; margin-top:-${size/2}px;
            `;
            document.body.appendChild(p);
            p.addEventListener('animationend', () => p.remove());
        }
    }

    (function initBubbles() {
        const container = document.getElementById('bubblesBg');
        if (!container) return;
        const config = [
            { w: 90,  l: 7,  d: 22, dl: 0,  op: 0.40, sc: 1.08, rot: 160 },
            { w: 38,  l: 17, d: 30, dl: 4,  op: 0.32, sc: 1.12, rot: 90  },
            { w: 130, l: 31, d: 19, dl: 8,  op: 0.22, sc: 1.05, rot: 220 },
            { w: 26,  l: 47, d: 35, dl: 2,  op: 0.50, sc: 1.15, rot: 45  },
            { w: 68,  l: 60, d: 24, dl: 11, op: 0.28, sc: 1.06, rot: 310 },
            { w: 100, l: 72, d: 27, dl: 5,  op: 0.20, sc: 1.04, rot: 135 },
            { w: 42,  l: 84, d: 33, dl: 1,  op: 0.44, sc: 1.10, rot: 260 },
            { w: 55,  l: 91, d: 21, dl: 7,  op: 0.38, sc: 1.07, rot: 70  },
            { w: 78,  l: 14, d: 38, dl: 3,  op: 0.24, sc: 1.08, rot: 190 },
            { w: 32,  l: 54, d: 28, dl: 9,  op: 0.45, sc: 1.14, rot: 330 },
            { w: 110, l: 77, d: 20, dl: 6,  op: 0.18, sc: 1.03, rot: 100 },
            { w: 48,  l: 40, d: 32, dl: 13, op: 0.36, sc: 1.09, rot: 245 },
        ];
        config.forEach(({ w, l, d, dl, op, sc, rot }) => {
            const el = document.createElement('div');
            el.className = 'bg-bubble';
            el.style.cssText = `
                width:${w}px; height:${w}px; left:${l}%;
                animation-duration:${d}s; animation-delay:-${dl}s;
                --b-op:${op}; --b-sc:${sc}; --b-rot:${rot}deg;
            `;
            container.appendChild(el);
        });
    })();

    (function initCursor() {
        const dot  = document.getElementById('cursorDot');
        const ring = document.getElementById('cursorRing');
        if (!dot || !ring) return;

        let mX = window.innerWidth  / 2;
        let mY = window.innerHeight / 2;
        let rX = mX, rY = mY;
        let visible = false;

        document.addEventListener('mousemove', (e) => {
            mX = e.clientX; mY = e.clientY;
            if (!visible) {
                visible = true;
                dot.style.opacity  = '1';
                ring.style.opacity = '1';
            }
            dot.style.left = mX + 'px';
            dot.style.top  = mY + 'px';
        });

        document.addEventListener('mouseleave', () => {
            dot.style.opacity  = '0';
            ring.style.opacity = '0';
            visible = false;
        });

        document.querySelectorAll('button, a, input, textarea, select, [tabindex="0"]').forEach(el => {
            el.addEventListener('mouseenter', () => {
                dot.classList.add('is-hovering');
                ring.classList.add('is-hovering');
            });
            el.addEventListener('mouseleave', () => {
                dot.classList.remove('is-hovering');
                ring.classList.remove('is-hovering');
            });
        });

        document.addEventListener('mousedown', () => dot.classList.add('is-clicking'));
        document.addEventListener('mouseup',   () => dot.classList.remove('is-clicking'));

        (function animRing() {
            rX += (mX - rX) * 0.10;
            rY += (mY - rY) * 0.10;
            ring.style.left = rX + 'px';
            ring.style.top  = rY + 'px';
            requestAnimationFrame(animRing);
        })();
    })();

    (function initRipples() {
        function spawnRipple(e, el) {
            const rect = el.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height) * 2.2;
            const x    = (e.clientX - rect.left) - size / 2;
            const y    = (e.clientY - rect.top)  - size / 2;
            const r    = document.createElement('span');
            r.className = 'ripple-wave';
            r.style.cssText = width:${size}px;height:${size}px;left:${x}px;top:${y}px;;
            el.appendChild(r);
            r.addEventListener('animationend', () => r.remove());
        }

        document.querySelectorAll('.btn, .main-tab-btn, .inner-tab-btn').forEach(el => {
            el.addEventListener('click', (e) => spawnRipple(e, el));
        });
    })();

    /**
     * URL-safe Base64 encode a 7-digit key.
     * Output uses '-' instead of '+' and '_' instead of '/' with padding stripped.
     * @param {string} key  — raw 7-digit numeric key
     * @returns {string}    — URL-safe Base64 string
     */
    function encodeKey(key) {
        return btoa(key)
            .replace(/=/g,  '')
            .replace(/\+/g, '-')
            .replace(/\//g, '_');
    }

    /**
     * Decode a URL-safe Base64 token back to the 7-digit key.
     * Returns null if the decoded value is not a valid 7-digit number.
     * @param {string} token  — URL-safe Base64 token from ?c=
     * @returns {string|null} — decoded 7-digit key or null
     */
    function decodeKey(token) {
        try {

            const b64 = token.replace(/-/g, '+').replace(/_/g, '/');

            const padded = b64 + '=='.slice(0, (4 - b64.length % 4) % 4);
            const decoded = atob(padded);
            return /^\d{7}$/.test(decoded) ? decoded : null;
        } catch {
            return null;
        }
    }

    /**
     * Clear the given container and render a fresh 180×180 QR code.
     * The QR encodes ONLY the public retrieval URL — never internal paths.
     * URL format: ?c=<url-safe-base64> (raw key is NOT exposed)
     * @param {string} containerId  — DOM id of the #*QrContainer div
     * @param {string} key          — the 7-digit share key returned by the API
     */
    function generateQR(containerId, key) {
        const container = document.getElementById(containerId);
        if (!container) return;

        container.innerHTML = '';

        const encoded     = encodeKey(key);
        const retrievalURL = ${CLIPSHARE_BASE_URL}?c=${encoded};

        if (typeof QRCode === 'undefined') {
            container.innerHTML = '<p style="font-size:0.8rem;color:#94a3b8">QR library not loaded.</p>';
            return;
        }

        new QRCode(container, {
            text        : retrievalURL,
            width       : 180,
            height      : 180,
            colorDark   : '#003d1f',   
            colorLight  : '#ffffff',
            correctLevel: QRCode.CorrectLevel.M,
        });

        const panel = container.closest('.qr-panel');
        if (panel) {
            panel.classList.remove('qr-hidden');
            panel.classList.add('qr-visible');
        }
    }

    /**
     * Wire the Download QR and Copy Link buttons for a given share result.
     * @param {string} downloadBtnId  — id of the Download QR button
     * @param {string} copyBtnId      — id of the Copy Link button
     * @param {string} copyMsgId      — id of the "Link copied!" flash message
     * @param {string} key            — the 7-digit share key
     */
    function wireQrActions(downloadBtnId, copyBtnId, copyMsgId, key) {
        const downloadBtn  = document.getElementById(downloadBtnId);
        const copyBtn      = document.getElementById(copyBtnId);
        const copyMsg      = document.getElementById(copyMsgId);
        const encoded      = encodeKey(key);
        const retrievalURL = ${CLIPSHARE_BASE_URL}?c=${encoded};

        if (downloadBtn) {
            const freshDownload = downloadBtn.cloneNode(true);
            downloadBtn.parentNode.replaceChild(freshDownload, downloadBtn);

            freshDownload.addEventListener('click', () => {
                const container = freshDownload.closest('.qr-glass-card').querySelector('.qr-container');
                const canvas = container.querySelector('canvas');
                const img    = container.querySelector('img');

                if (canvas) {
                    const link = document.createElement('a');
                    link.download = clipshare-${key}.png;
                    link.href     = canvas.toDataURL('image/png');
                    link.click();
                } else if (img) {
                    const link = document.createElement('a');
                    link.download = clipshare-${key}.png;
                    link.href     = img.src;
                    link.click();
                }
            });
        }

        if (copyBtn) {
            const freshCopy = copyBtn.cloneNode(true);
            copyBtn.parentNode.replaceChild(freshCopy, copyBtn);

            freshCopy.addEventListener('click', () => {
                navigator.clipboard.writeText(retrievalURL).then(() => {
                    if (copyMsg) {
                        copyMsg.classList.remove('hidden');
                        setTimeout(() => copyMsg.classList.add('hidden'), 2200);
                    }
                });
            });
        }
    }

    (function initUrlKeyAutofill() {
        const params = new URLSearchParams(window.location.search);
        const token  = params.get('c');
        if (!token) return;

        const urlKey = decodeKey(token);
        if (!urlKey) return; 

        const retrieveTabBtn = document.getElementById('tab-retrieve');
        if (retrieveTabBtn && !retrieveTabBtn.classList.contains('active')) {
            retrieveTabBtn.click();
        }

        const keyInput = document.getElementById('retrieveKeyInput');
        if (keyInput) {
            keyInput.value = urlKey;
        }

        const retrieveForm = document.getElementById('retrieveForm');
        if (retrieveForm) {
            setTimeout(() => retrieveForm.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true })), 350);
        }
    })();

});
