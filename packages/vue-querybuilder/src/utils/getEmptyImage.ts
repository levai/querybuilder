/**
 * 1x1 透明图，用于 hideDefaultDragPreview 时替代浏览器默认拖拽预览。
 * 与 @react-querybuilder/dnd getEmptyImage 一致。
 */
let emptyImage: HTMLImageElement | null = null;

export function getEmptyImage(): HTMLImageElement {
  if (!emptyImage) {
    emptyImage = new Image();
    emptyImage.src = 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==';
  }
  return emptyImage;
}
