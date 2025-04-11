import { useQueryState, parseAsBoolean } from "nuqs";

export const useCreateWorkspaceModal = () => {
  const [isOpen, setIsOpen] = useQueryState(
    "create-workspace", // what query param in the URL controls this state
    parseAsBoolean // parsing query (string) into a boolean value
      .withDefault(false)
      .withOptions({ clearOnDefault : true }) // once the modal is closed, remove the query from the URL.
  )

  const open = () => setIsOpen(true);
  const close = () => setIsOpen(false);

  return {
    isOpen,
    open,
    close,
    setIsOpen // in case direct access to the state is needed
  }
}