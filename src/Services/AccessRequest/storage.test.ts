import { createTrackingCode, parseTrackingCode } from "./storage";

describe("access request tracking code", () => {
  it("combina protocolo e segredo em um único código reversível", () => {
    const protocol = "AC-20261014-ABCDEF1234";
    const trackingKey = "a".repeat(43);
    const code = createTrackingCode(protocol, trackingKey);

    expect(parseTrackingCode(code)).toEqual({ protocol, trackingKey });
  });

  it("recusa códigos incompletos", () => {
    expect(parseTrackingCode("somente-protocolo")).toBeNull();
    expect(parseTrackingCode("protocolo.chave-curta")).toBeNull();
  });
});
