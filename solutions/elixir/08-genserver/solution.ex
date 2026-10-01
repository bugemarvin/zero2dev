defmodule Stack do
  use GenServer

  # ---- client API ----

  def start_link(initial \\ []) do
    GenServer.start_link(__MODULE__, initial)
  end

  def push(pid, item), do: GenServer.cast(pid, {:push, item})

  def pop(pid), do: GenServer.call(pid, :pop)

  def peek(pid), do: GenServer.call(pid, :peek)

  def size(pid), do: GenServer.call(pid, :size)

  # ---- server callbacks ----

  @impl true
  def init(initial) do
    {:ok, initial}
  end

  @impl true
  def handle_cast({:push, item}, stack) do
    {:noreply, [item | stack]}
  end

  @impl true
  def handle_call(:pop, _from, [top | rest]) do
    {:reply, {:ok, top}, rest}
  end

  def handle_call(:pop, _from, []) do
    {:reply, :empty, []}
  end

  def handle_call(:peek, _from, [top | _] = stack) do
    {:reply, {:ok, top}, stack}
  end

  def handle_call(:peek, _from, []) do
    {:reply, :empty, []}
  end

  def handle_call(:size, _from, stack) do
    {:reply, length(stack), stack}
  end
end
