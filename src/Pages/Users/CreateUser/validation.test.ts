import { PROFILE_TYPE, ROLE } from "../../../Controller/controllerGlobal";
import { buildCreateUserSchema } from "./validation";

const validBase = {
  name: "Pessoa de Teste",
  username: "pessoa.teste",
  password: "senha123",
  confirmPassword: "senha123",
  role: ROLE.USER,
  social_technologies: [1],
};

describe("CreateUser validation", () => {
  it("rejects a short username and password", async () => {
    await expect(
      buildCreateUserSchema(ROLE.USER, PROFILE_TYPE.COORDINATOR).validate({
        ...validBase,
        username: "abcd",
        password: "1234567",
        confirmPassword: "1234567",
        current_type: PROFILE_TYPE.COORDINATOR,
        email: "pessoa@instituicao.org",
      }),
    ).rejects.toBeDefined();
  });

  it("accepts OTHER with phone and no email", async () => {
    await expect(
      buildCreateUserSchema(ROLE.USER, PROFILE_TYPE.OTHER).validate({
        ...validBase,
        current_type: PROFILE_TYPE.OTHER,
        email: "",
        phone: "(82) 9 9999-9999",
      }),
    ).resolves.toBeDefined();
  });

  it("rejects OTHER without phone and email", async () => {
    await expect(
      buildCreateUserSchema(ROLE.USER, PROFILE_TYPE.OTHER).validate({
        ...validBase,
        current_type: PROFILE_TYPE.OTHER,
        email: "",
        phone: "",
      }),
    ).rejects.toBeDefined();
  });
});
