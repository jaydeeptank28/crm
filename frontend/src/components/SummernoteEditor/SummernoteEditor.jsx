import { useEffect, useRef } from 'react';
import './SummernoteEditor.css';

/**
 * SummernoteEditor - Matches PHP CRM's Summernote configuration exactly
 * 
 * PHP Config:
 * $('#taskDescription').summernote({
 *     minHeight: 200,
 *     toolbar: [
 *         ['style', ['bold', 'italic', 'underline', 'clear']],
 *         ['font', ['strikethrough']],
 *         ['para', ['paragraph']]
 *     ],
 * });
 */
const SummernoteEditor = ({ id, value, onChange, placeholder = '' }) => {
    const editorRef = useRef(null);
    const isInitialized = useRef(false);

    useEffect(() => {
        // Wait for jQuery and Summernote to be available (loaded from index.html)
        const initEditor = () => {
            const $ = window.jQuery;

            if (!$ || !$.fn.summernote) {
                // Retry later if not ready
                setTimeout(initEditor, 100);
                return;
            }

            if (editorRef.current && !isInitialized.current) {
                const $editor = $(editorRef.current);

                // Initialize Summernote with PHP's exact configuration
                $editor.summernote({
                    placeholder: placeholder,
                    minHeight: 200,
                    toolbar: [
                        ['style', ['bold', 'italic', 'underline', 'clear']],
                        ['font', ['strikethrough']],
                        ['para', ['paragraph']]
                    ],
                    callbacks: {
                        onChange: function (contents) {
                            if (onChange) {
                                onChange(contents);
                            }
                        }
                    }
                });

                // Set initial value
                if (value) {
                    $editor.summernote('code', value);
                }

                isInitialized.current = true;
            }
        };

        // Small delay to ensure DOM is ready
        setTimeout(initEditor, 100);

        return () => {
            if (isInitialized.current && window.jQuery && editorRef.current) {
                try {
                    window.jQuery(editorRef.current).summernote('destroy');
                } catch (e) {
                    // Ignore cleanup errors
                }
            }
            isInitialized.current = false;
        };
    }, [placeholder, onChange]);

    // Update editor content when value prop changes externally
    useEffect(() => {
        if (isInitialized.current && window.jQuery && editorRef.current) {
            const $ = window.jQuery;
            const currentContent = $(editorRef.current).summernote('code');
            if (value !== currentContent) {
                $(editorRef.current).summernote('code', value || '');
            }
        }
    }, [value]);

    return (
        <div className="summernote-wrapper">
            <textarea
                ref={editorRef}
                id={id}
                className="form-control summernote-simple"
                defaultValue={value}
            />
        </div>
    );
};

export default SummernoteEditor;
