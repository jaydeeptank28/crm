import { useRef, useCallback, useMemo, memo } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import './RichTextEditor.css';

/**
 * RichTextEditor - Stable, smooth rich text editor using ReactQuill
 * 
 * Features:
 * - No shaking or focus issues
 * - Debounced onChange to prevent re-renders
 * - Memoized component to avoid unnecessary re-renders
 * - Clean minimal UI matching our design
 */
const RichTextEditor = memo(({ id, value, onChange, placeholder = 'Enter description...' }) => {
    const quillRef = useRef(null);
    const timeoutRef = useRef(null);

    // Debounced onChange handler - waits 300ms after typing stops
    const handleChange = useCallback((content, delta, source, editor) => {
        if (source !== 'user') return;

        // Clear previous timeout
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        // Debounce the onChange callback
        timeoutRef.current = setTimeout(() => {
            if (onChange) {
                // Get HTML content, but treat empty editor as empty string
                const html = editor.getHTML();
                const isEmpty = editor.getText().trim().length === 0;
                onChange(isEmpty ? '' : html);
            }
        }, 300);
    }, [onChange]);

    // Toolbar configuration - clean and minimal
    // Matches common features: Bold, Italic, Underline, Headers, Lists, Links
    const modules = useMemo(() => ({
        toolbar: [
            [{ 'header': [1, 2, 3, false] }],
            ['bold', 'italic', 'underline', 'strike'],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }],
            ['link'],
            ['clean']
        ],
        clipboard: {
            matchVisual: false
        }
    }), []);

    const formats = useMemo(() => [
        'header',
        'bold', 'italic', 'underline', 'strike',
        'list', 'bullet',
        'link'
    ], []);

    return (
        <div className="rich-text-editor-wrapper" id={id}>
            <ReactQuill
                ref={quillRef}
                theme="snow"
                value={value || ''}
                onChange={handleChange}
                modules={modules}
                formats={formats}
                placeholder={placeholder}
            />
        </div>
    );
});

RichTextEditor.displayName = 'RichTextEditor';

export default RichTextEditor;
