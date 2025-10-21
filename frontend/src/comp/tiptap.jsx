import React, { useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import TextAlign from "@tiptap/extension-text-align";
// import Heading from "@tiptap/extension-heading";
import Underline from "@tiptap/extension-underline";
import { FaAlignLeft, FaAlignCenter, FaAlignRight } from "react-icons/fa";


export default function TiptapEditor({ value, onEditorChange }) {
  // สร้าง editor พร้อมค่าเริ่มต้น
  const editor = useEditor({
  extensions: [
    StarterKit.configure({
      heading: { levels: [1, 2, 3] }, 
      // StarterKit มี heading อยู่แล้ว ถ้าอยากปรับระดับก็ configure ตรงนี้
    }),
    Underline,
    Link.configure({
      openOnClick: false,
    }),
    TextAlign.configure({
      types: ["heading", "paragraph"],
    }),
  ],
  content: value || "",
  onUpdate: ({ editor }) => {
    onEditorChange(editor.getHTML());
  },
});

  // เมื่อค่า value จากภายนอกเปลี่ยน (เช่น โหลดข้อมูลเดิมจาก DB)
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value || "");
    }
  }, [value, editor]);

  if (!editor) return null;

  const buttonClass = (isActive) =>
    `px-2 py-1 rounded transition ${
    isActive ? "bg-[#8E80FF] text-white" : "bg-gray-100 hover:bg-gray-200"
  }`;

  return (
    <div className="border rounded-xl p-4 bg-white shadow-sm " >
      <div className="flex flex-wrap gap-2 mb-3 items-center">
        {/* Format */}
        <button type="button" onClick={() => editor.chain().focus().toggleBold().run()} className={buttonClass(editor.isActive("bold"))}>B</button>
        <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()} className={buttonClass(editor.isActive("italic"))}>I</button>
        <button type="button" onClick={() => editor.chain().focus().toggleUnderline().run()} className={buttonClass(editor.isActive("underline"))}>U</button>
        <span className="mx-1 border-l border-gray-300 h-5" />
        <button type="button" onClick={() => editor.chain().focus().toggleBulletList().run()} className={buttonClass(editor.isActive("bulletList"))}>•</button>
        <button type="button" onClick={() => editor.chain().focus().toggleOrderedList().run()} className={buttonClass(editor.isActive("orderedList"))}>1.</button>
        <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={buttonClass(editor.isActive("heading", { level: 2 }))}>H2</button>
        <span className="mx-1 border-l border-gray-300 h-5" />
        {/* Align */}
        <button
        type="button"
        onClick={() => editor.chain().focus().setTextAlign("left").run()}
        className={buttonClass(editor.isActive({ textAlign: "left" }))}
        title="จัดชิดซ้าย"
        >
        <FaAlignLeft />
        </button>

        <button
        type="button"
        onClick={() => editor.chain().focus().setTextAlign("center").run()}
        className={buttonClass(editor.isActive({ textAlign: "center" }))}
        title="จัดกลาง"
        >
        <FaAlignCenter />
        </button>

        <button
        type="button"
        onClick={() => editor.chain().focus().setTextAlign("right").run()}
        className={buttonClass(editor.isActive({ textAlign: "right" }))}
        title="จัดชิดขวา"
        >
        <FaAlignRight />
        </button>
        <span className="mx-1 border-l border-gray-300 h-5" />
        {/* Undo / Redo */}
        <button type="button" onClick={() => editor.chain().focus().undo().run()} className={buttonClass(false)}>↩</button>
        <button type="button" onClick={() => editor.chain().focus().redo().run()} className={buttonClass(false)}>↪</button>
        <button type="button" onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()} className={buttonClass(false)}>🧹</button>
        <span className="mx-1 border-l border-gray-300 h-5" />
        {/* Link */}
        <button
          type="button"
          onClick={() => {
            const url = prompt("ใส่ลิงก์ที่ต้องการ:");
            if (url) editor.chain().focus().setLink({ href: url }).run();
          }}
          className={buttonClass(editor.isActive("link"))}
        >
          🔗
        </button>
      </div>
        <EditorContent
          editor={editor}

          className="w-full border-2 border-[#C8B8FF] rounded-2xl p-4 min-h-[50px] bg-white shadow-md
                    ProseMirror list-disc list-outside marker:text-[#8E80FF] focus:outline-none focus:ring-0 max-w-none leading-relaxed text-gray-800"
        />

    </div>
  );
}
