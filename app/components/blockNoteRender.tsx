export function BlockNoteRender({
  html,
  theme,
}: {
  html: string;
  theme: string;
}) {
  return (
    <div
      className="bn-container bn-mantine bn-render"
      data-color-scheme={theme}
    >
      <div
        className="ProseMirror bn-editor bn-default-styles p-0!"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}
