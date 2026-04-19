"use client";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import Link from "@tiptap/extension-link";
import Underline from "@tiptap/extension-underline";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import { common as lowlight } from "lowlight";
import 'katex/dist/katex.min.css';
import { useEffect, useRef } from "react";

// TODO: Add math/KaTeX, embed, and image upload logic

export default function RichTextEditor({ value, onChange, placeholder }) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Image,
      Placeholder.configure({ placeholder }),
      Link,
      Underline,
      CodeBlockLowlight.configure({ lowlight }),
      // Add math/KaTeX and embed extensions here
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: "min-h-[80px] w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 focus:outline-none",
      },
    },
  });

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value || "", false);
    }
    // eslint-disable-next-line
  }, [value]);

  // Image upload handler
  const fileInputRef = useRef(null);
  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (data.url) {
        editor?.chain().focus().setImage({ src: data.url }).run();
      } else {
        alert(data.error || "Upload failed");
      }
    } catch (err) {
      alert("Upload failed");
    }
    // Reset input value so same file can be picked again
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div>
      {/* Toolbar with formatting, image upload, and embed */}
      <div className="mb-2 flex flex-wrap gap-2">
        <button type="button" onClick={() => editor?.chain().focus().toggleBold().run()} className="px-2 py-1 border rounded">B</button>
        <button type="button" onClick={() => editor?.chain().focus().toggleItalic().run()} className="px-2 py-1 border rounded italic">I</button>
        <button type="button" onClick={() => editor?.chain().focus().toggleUnderline().run()} className="px-2 py-1 border rounded underline">U</button>
        <button type="button" onClick={() => editor?.chain().focus().toggleStrike().run()} className="px-2 py-1 border rounded line-through">S</button>
        <button type="button" onClick={() => editor?.chain().focus().toggleCodeBlock().run()} className="px-2 py-1 border rounded">Code</button>
        {/* Image upload button */}
        <button type="button" onClick={() => fileInputRef.current?.click()} className="px-2 py-1 border rounded">🖼️</button>
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          style={{ display: "none" }}
          onChange={handleImageUpload}
        />
        {/* Embed button */}
        <button type="button" onClick={() => {
          const url = window.prompt("Enter YouTube or website URL to embed:");
          if (!url) return;
          let embedHtml = "";
          // YouTube detection
          const ytMatch = url.match(/(?:youtu.be\/|youtube.com\/(?:embed\/|v\/|watch\?v=|shorts\/))([\w-]{11})/);
          if (ytMatch) {
            const videoId = ytMatch[1];
            embedHtml = `<iframe width='560' height='315' src='https://www.youtube.com/embed/${videoId}' frameborder='0' allowfullscreen></iframe>`;
          } else {
            // Generic website embed
            embedHtml = `<iframe src='${url}' width='560' height='315' frameborder='0' allowfullscreen></iframe>`;
          }
          editor?.commands.insertContent(embedHtml);
        }} className="px-2 py-1 border rounded">🔗</button>
        {/* Math button: insert $...$ */}
        <button type="button" onClick={() => {
          editor?.chain().focus().insertContent('$math$').run();
        }} className="px-2 py-1 border rounded">∑</button>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
