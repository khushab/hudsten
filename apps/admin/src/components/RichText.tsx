import { useEffect } from "react";
import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import { cn } from "@/lib/cn";

/**
 * Tiptap WYSIWYG bound to an HTML string. Emits "" (not "<p></p>") for an empty
 * doc so a blank field saves as null/empty instead of a stray paragraph.
 */
export function RichText({
  value,
  onChange,
  id,
}: {
  value: string | null;
  onChange: (html: string) => void;
  id?: string;
}) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({ openOnClick: false, autolink: true }),
    ],
    content: value || "",
    onUpdate: ({ editor }) => {
      onChange(editor.isEmpty ? "" : editor.getHTML());
    },
    editorProps: {
      attributes: {
        // `prose` keeps the WYSIWYG output looking like the rendered PDP copy.
        class: "prose prose-sm max-w-none min-h-32 px-3 py-2 outline-none",
        ...(id ? { id } : {}),
      },
    },
  });

  // Keep content in sync when `value` changes from OUTSIDE (e.g. a product loads).
  // Guard on getHTML() so we don't reset the doc — and the cursor — on each keystroke.
  useEffect(() => {
    if (!editor) return;
    const next = value || "";
    if (next !== editor.getHTML()) {
      editor.commands.setContent(next, { emitUpdate: false });
    }
  }, [value, editor]);

  if (!editor) return null;

  return (
    <div className="rounded-md border border-stone-300 bg-paper focus-within:border-ink">
      <Toolbar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
}

function Toolbar({ editor }: { editor: Editor }) {
  const setLink = () => {
    const prev = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("Link URL", prev ?? "https://");
    if (url === null) return; // cancelled
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  return (
    <div className="flex flex-wrap items-center gap-0.5 border-b border-stone-200 px-1.5 py-1">
      <TbBtn active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()} label="Bold">
        <span className="font-bold">B</span>
      </TbBtn>
      <TbBtn active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()} label="Italic">
        <span className="italic">I</span>
      </TbBtn>
      <TbBtn
        active={editor.isActive("heading", { level: 2 })}
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        label="Heading 2"
      >
        H2
      </TbBtn>
      <TbBtn
        active={editor.isActive("heading", { level: 3 })}
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        label="Heading 3"
      >
        H3
      </TbBtn>
      <TbBtn
        active={editor.isActive("bulletList")}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        label="Bullet list"
      >
        •
      </TbBtn>
      <TbBtn
        active={editor.isActive("orderedList")}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        label="Numbered list"
      >
        1.
      </TbBtn>
      <TbBtn active={editor.isActive("link")} onClick={setLink} label="Link">
        Link
      </TbBtn>
      <TbBtn
        active={false}
        onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()}
        label="Clear formatting"
      >
        Clear
      </TbBtn>
    </div>
  );
}

function TbBtn({
  active,
  onClick,
  label,
  children,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      aria-pressed={active}
      className={cn(
        "inline-flex h-7 min-w-7 items-center justify-center rounded px-1.5 text-xs font-medium transition-colors",
        active ? "bg-ink text-paper" : "text-stone-600 hover:bg-stone-100",
      )}
    >
      {children}
    </button>
  );
}
