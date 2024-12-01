export function initializeStripeService() {
  const compraModal = new bootstrap.Modal(
    document.getElementById("compraModal")
  );
  const confirmPaymentBtn = document.getElementById("confirmPaymentBtn");
  const modalFooter = document.querySelector(".modal-footer");
  let selectedPriceId = "";
  let selectedGameId = ""; // Define selectedGameId

  // Manejar el clic en el botón "Comprar"
  document.addEventListener("click", (event) => {
    if (event.target.classList.contains("comprar-btn")) {
      const gameTitle = event.target.dataset.title;
      const gamePrice = event.target.dataset.price;
      selectedPriceId = event.target.dataset.priceId;
      selectedGameId = event.target.dataset.gameId; // Captura el gameId del botón

      // Actualiza el contenido del modal con la información del juego
      document.getElementById("gameTitle").textContent = `Juego: ${gameTitle}`;
      document.getElementById(
        "gamePrice"
      ).textContent = `Precio: $${gamePrice}`;

      // Mostrar los botones del modal
      modalFooter.classList.remove("d-none");

      // Muestra el modal
      compraModal.show();
    }
  });

  confirmPaymentBtn.addEventListener("click", async () => {
    try {
      // Cerrar el modal antes de redirigir
      compraModal.hide();

      // const token = document.cookie
      //   .split("; ")
      //   .find((row) => row.startsWith("token="))
      //   ?.split("=")[1];

      // if (!token) {
      //   console.error("Token no encontrado en las cookies");
      // }

      // Crear una sesión de pago en el servidor
      const response = await fetch(
        "http://localhost:3000/create-checkout-session",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            priceId: selectedPriceId,
            gameId: selectedGameId,
          }), // Envía el gameId y priceId
        }
      );

      if (!response.ok) {
        throw new Error("No se pudo crear la sesión de pago.");
      }

      const { sessionId } = await response.json();

      // Redirigir a Stripe para el pago
      const stripe = Stripe(
        "pk_test_51QPCNnGAB1NMfz0pds1OFvpkXpTx3Vu1BCqntod0XYln2v45sEmUOfcizau54KfujrGHr9tmdgb7vW0mgAhAmuq700KWSKi1tP"
      );
      const { error } = await stripe.redirectToCheckout({ sessionId });

      if (error) {
        throw new Error(error.message);
      }
    } catch (error) {
      console.error("Error iniciando el pago:", error);

      // Mostrar mensaje de error
      alert("Error al procesar el pago. Por favor, intenta nuevamente.");
    }
  });

  // Verificar el estado del pago al cargar la página
  const urlParams = new URLSearchParams(window.location.search);
  const sessionId = urlParams.get("session_id");

  if (sessionId) {
    fetch(`http://localhost:3000/session-status?session_id=${sessionId}`, {
      method: "GET",
      credentials: "include", // Asegura que se envíen las cookies
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("No autorizado o error en la solicitud.");
        }
        return response.json();
      })
      .then((session) => {
        compraModal.show();
        document.getElementById("gameInfo").classList.add("d-none");
        document.getElementById("paymentStatus").classList.remove("d-none");

        // Ocultar los botones del modal
        modalFooter.classList.add("d-none");

        if (session.status === "paid") {
          document.getElementById(
            "paymentMessage"
          ).textContent = `Pago completado con éxito. Un correo ha sido enviado a ${session.customer_email}`;
        } else {
          document.getElementById("paymentMessage").textContent =
            "El pago no se completó. Intenta nuevamente.";
        }
      })
      .catch((error) => {
        console.error("Error verificando el estado del pago:", error);
        document.getElementById("paymentMessage").textContent =
          "No se pudo verificar el estado del pago.";
      });
  }
}
