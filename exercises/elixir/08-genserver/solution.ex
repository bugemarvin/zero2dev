defmodule Stack do
  use GenServer

  # ---- client API ----

  def start_link(initial \\ []) do
    GenServer.start_link(__MODULE__, initial)
  end

  def push(_pid, _item) do
    :todo
  end

  def pop(_pid) do
    :todo
  end

  def peek(_pid) do
    :todo
  end

  def size(_pid) do
    :todo
  end

  # ---- server callbacks ----

  @impl true
  def init(initial) do
    {:ok, initial}
  end
end
